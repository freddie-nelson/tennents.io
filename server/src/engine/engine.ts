import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { Entity } from "../rooms/schema/Entity";
import { EntityType } from "../rooms/schema/enums/EntityType";
import { Player } from "../rooms/schema/Player";
import { GameMap } from "../../../shared/map/map";
import mapJson from "../../../shared/assets/map.json";

export class GameEngine {
  static readonly DRUNKINESS_LOSS: number = 0.1;
  static readonly PLAYER_RADIUS: number = 0.75;
  static readonly PLAYER_SPEED: number = 0.25;
  static readonly PROJECTILE_RADIUS: number = 0.5;
  static readonly PROJECTILE_LIFETIME: number = 5;
  static readonly PROJECTILE_SPEED: number = 0.5;
  static readonly PICKUP_RADIUS: number = 3.5;
  static readonly TILE_SIZE: number = 2;

  private engine: Matter.Engine;
  private collisionCallback: (event: Matter.IEventCollision<Matter.Engine>) => void;
  private entities: Map<number, Matter.Body>;
  private id: number;
  private spawnableTiles: { x: number; y: number }[] = [];
  pickupSpawnableTiles: { x: number; y: number }[] = [];

  constructor(collisionCallback: (event: Matter.IEventCollision<Matter.Engine>) => void) {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    this.collisionCallback = collisionCallback;
    this.entities = new Map<number, Matter.Body>();
    this.id = 0;

    this.initCollisions();
    this.initMap();
  }

  // HELPERS - INITIALIZATION

  initMap() {
    const map = new GameMap(mapJson);
    map.tiles.forEach((tile) => {
      if (tile.isPlayerSpawn) {
        this.spawnableTiles.push({
          x: tile.x * GameEngine.TILE_SIZE - GameEngine.TILE_SIZE / 2,
          y: tile.y * GameEngine.TILE_SIZE - GameEngine.TILE_SIZE / 2,
        });
      }
      if (tile.isPickupSpawn) {
        this.pickupSpawnableTiles.push({
          x: tile.x * GameEngine.TILE_SIZE - GameEngine.TILE_SIZE / 2,
          y: tile.y * GameEngine.TILE_SIZE - GameEngine.TILE_SIZE / 2,
        });
      }
      if (!tile.isCollidable) {
        return;
      }
      const x = tile.x;
      const y = tile.y;

      const entity = Matter.Bodies.rectangle(
        x * GameEngine.TILE_SIZE,
        y * GameEngine.TILE_SIZE,
        GameEngine.TILE_SIZE,
        GameEngine.TILE_SIZE
      );
      entity.isStatic = true;
      Matter.Composite.add(this.engine.world, entity);
    });
  }

  private initCollisions() {
    Matter.Events.on(this.engine, "collisionStart", this.collisionCallback);
  }

  private addEntity({
    x,
    y,
    radius,
    r,
    velX,
    velY,
    type,
  }: {
    x: number;
    y: number;
    radius: number;
    r: number;
    velX: number;
    velY: number;
    type: EntityType;
  }): Matter.Body {
    this.id++;

    const entity = Matter.Bodies.circle(x, y, radius, {
      angle: r,
      velocity: { x: velX, y: velY },
    });
    entity.plugin.id = this.id;
    entity.plugin.type = type;
    Matter.Body.setVelocity(entity, {
      x: velX,
      y: velY,
    });

    Matter.Composite.add(this.engine.world, entity);
    this.entities.set(this.id, entity);

    return entity;
  }

  private updateStateEntities(stateEntities: MapSchema<Entity, string>) {
    for (const [id, entity] of stateEntities) {
      const gameEntity = this.entities.get(parseInt(id));

      let changed = false;
      if (entity.pos.x !== gameEntity.position.x || entity.pos.y !== gameEntity.position.y) {
        entity.pos.x = gameEntity.position.x;
        entity.pos.y = gameEntity.position.y;

        changed = true;
      }

      if (entity.velocity.x !== gameEntity.velocity.x || entity.velocity.y !== gameEntity.velocity.y) {
        entity.velocity.x = gameEntity.velocity.x;
        entity.velocity.y = gameEntity.velocity.y;

        changed = true;
      }

      if (entity.rotation !== gameEntity.angle) {
        entity.rotation = gameEntity.angle;

        changed = true;
      }

      if (entity.type === EntityType.PLAYER && (entity as Player).drunkiness > 0) {
        const player = entity as Player;
        player.drunkiness -= GameEngine.DRUNKINESS_LOSS;
        changed = true;
      }

      if (changed) {
        stateEntities.set(id, entity);
      }
    }
  }

  addPlayer({ x, y, r }: { x: number; y: number; r: number }): number {
    const entity = this.addEntity({
      x,
      y,
      r,
      velX: 0,
      velY: 0,
      radius: GameEngine.PLAYER_RADIUS,
      type: EntityType.PLAYER,
    });
    entity.frictionAir = 0.1;

    return this.id;
  }

  addProjectile({ x, y, r, ownerId, factor}: { x: number; y: number; r: number; ownerId: number; factor: number}): number {
    const dx = Math.cos(r);
    const dy = Math.sin(r);

    const entity = this.addEntity({
      x: x + dx * GameEngine.PLAYER_RADIUS * GameEngine.PROJECTILE_RADIUS * (factor),
      y: y + dy * GameEngine.PLAYER_RADIUS * GameEngine.PROJECTILE_RADIUS * (factor),
      r,
      velX: dx * GameEngine.PROJECTILE_SPEED * (1 - factor / 15),
      velY: dy * GameEngine.PROJECTILE_SPEED * (1 - factor / 15),
      radius: GameEngine.PROJECTILE_RADIUS * (factor / 4),
      type: EntityType.PROJECTILE,
    });
    entity.frictionAir = 0.01;
    entity.plugin.ownerId = ownerId;
    entity.plugin.lifetime = GameEngine.PROJECTILE_LIFETIME;

    return this.id;
  }

  addPickup({ x, y, type }: { x: number; y: number; type: EntityType.WEAPON | EntityType.HEALING }): number {
    const entity = this.addEntity({
      x,
      y,
      r: Math.random() * Math.PI * 2,
      velX: 0,
      velY: 0,
      radius: GameEngine.PLAYER_RADIUS / 2,
      type,
    });
    entity.isStatic = true;
    entity.isSensor = true;

    return this.id;
  }

  findClosestPickupEntity(entityId: number): number | null {
    const entity = this.entities.get(entityId);

    if (!entity) return null;

    let closestPickupId = -1;
    let closestPickupDistance = Infinity;

    for (const [id, otherEntity] of this.entities) {
      if (otherEntity.plugin.type !== EntityType.WEAPON && otherEntity.plugin.type !== EntityType.HEALING)
        continue;

      const distance = Matter.Vector.magnitude(Matter.Vector.sub(entity.position, otherEntity.position));

      if (distance < closestPickupDistance && distance <= GameEngine.PICKUP_RADIUS) {
        closestPickupId = id;
        closestPickupDistance = distance;
      }
    }

    return closestPickupId === -1 ? null : closestPickupId;
  }

  removeEntity(id: number) {
    const entity = this.entities.get(id);
    if (!entity) return;

    if (Matter.Composite.get(this.engine.world, entity.id, entity.type) !== null) {
      Matter.Composite.remove(this.engine.world, entity);
    }

    this.entities.delete(id);
  }

  // METHODS - LIFE CYCLE

  update(delta: number, stateEntities: MapSchema<Entity, string>) {
    Matter.Engine.update(this.engine, delta);

    for (const entity of this.entities.values()) {
      // entities with a lifetime
      if (!entity.plugin.lifetime) continue;

      entity.plugin.lifetime--;
      if (entity.plugin.lifetime <= 0) {
        this.removeEntity(entity.id);
        stateEntities.delete(`${entity.id}`);
      }
    }

    this.updateStateEntities(stateEntities);
  }

  dispose() {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }

  // METHODS - EVENT HANDLERS

  handleMove({ id, speed, x, y }: { id: number; speed: number; x: number; y: number }) {
    const entity = this.entities.get(id);
    Matter.Body.setVelocity(entity, { x: x * speed, y: y * speed });
  }

  handleRotation({ id, r }: { id: number; r: number }) {
    const entity = this.entities.get(id);
    Matter.Body.setAngle(entity, r);
  }

  getSpawnableTile(): { x: number; y: number } {
    return this.spawnableTiles[Math.floor(Math.random() * this.spawnableTiles.length)];
  }

  getPickSpawnableTile(): { x: number; y: number } {
    return this.pickupSpawnableTiles[Math.floor(Math.random() * this.pickupSpawnableTiles.length)];
  }
}
