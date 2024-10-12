import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { Entity } from "../rooms/schema/Entity";
import { EntityType } from "../rooms/schema/enums/EntityType";
import { Player } from "../rooms/schema/Player";

export class GameEngine {
  private static DRUNKINESS_GAIN: number = 0.1;
  private static PLAYER_RADIUS: number = 1;
  private static PROJECTILE_RADIUS: number = 0.5;

  private static PROJECTILE_SPEED: number = 0.1;

  private engine: Matter.Engine;
  private entities: Map<number, Matter.Body>;
  private id: number;

  constructor() {
    this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
    this.entities = new Map<number, Matter.Body>();
    this.id = 0;

    this.initMap();
  }

  // HELPERS

  private initMap() {
    // TODO
  }

  private addEntity({
    x,
    y,
    radius,
    r,
    velX,
    velY,
  }: {
    x: number;
    y: number;
    radius: number;
    r: number;
    velX: number;
    velY: number;
  }): Matter.Body {
    this.id++;

    const entity = Matter.Bodies.circle(x, y, radius, {
      angle: r,
      velocity: { x: velX, y: velY },
    });
    Matter.Body.setVelocity(entity, {
      x: velX,
      y: velY,
    });
    this.entities.set(this.id, entity);
    Matter.Composite.add(this.engine.world, entity);

    return entity;
  }

  // CREATION

  addPlayer({ x, y, r }: { x: number; y: number; r: number }): number {
    const entity = this.addEntity({
      x,
      y,
      r,
      velX: 0,
      velY: 0,
      radius: GameEngine.PLAYER_RADIUS,
    });
    entity.frictionAir = 0.1;

    return this.id;
  }

  addProjectile({ x, y, r }: { x: number; y: number; r: number }): number {
    const dx = Math.cos(r);
    const dy = Math.sin(r);

    const entity = this.addEntity({
      x: x + dx * GameEngine.PLAYER_RADIUS,
      y: y + dy * GameEngine.PLAYER_RADIUS,
      r,
      velX: dx * GameEngine.PROJECTILE_SPEED,
      velY: dy * GameEngine.PROJECTILE_SPEED,
      radius: GameEngine.PROJECTILE_RADIUS,
    });
    entity.frictionAir = 0;

    return this.id;
  }

  // GENERAL

  update(delta: number) {
    Matter.Engine.update(this.engine, delta);
  }

  removeEntity(id: number) {
    const entity = this.entities.get(id);
    this.entities.delete(id);
    Matter.Composite.remove(this.engine.world, entity);
  }

  dispose() {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
  }

  updateStateEntities(stateEntities: MapSchema<Entity, string>) {
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

      if (entity.type === EntityType.PLAYER) {
        const player = entity as Player;
        player.drunkiness += GameEngine.DRUNKINESS_GAIN;
        changed = true;
      }

      if (changed) {
        stateEntities.set(id, entity);
      }
    }
  }

  // EVENT HANDLERS

  handleMove({ id, speed, x, y }: { id: number; speed: number; x: number; y: number }) {
    const entity = this.entities.get(id);
    Matter.Body.setVelocity(entity, { x: x * speed, y: y * speed });
  }

  handleRotation({ id, r }: { id: number; r: number }) {
    const entity = this.entities.get(id);
    Matter.Body.setAngle(entity, r);
  }
}
