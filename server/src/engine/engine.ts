import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { Entity } from "../rooms/schema/Entity";
import { EntityType } from "../rooms/schema/enums/EntityType";
import { Player } from "../rooms/schema/Player";

export class GameEngine {
	static readonly DRUNKINESS_LOSS: number = 0.1;
	static readonly PLAYER_RADIUS: number = 1;
	static readonly PLAYER_SPEED: number = 0.1;
	static readonly PROJECTILE_RADIUS: number = 0.5;
	static readonly PROJECTILE_LIFETIME: number = 100;
	static readonly PROJECTILE_SPEED: number = 0.2;

	private engine: Matter.Engine;
	private entities: Map<number, Matter.Body>;
	private id: number;

	constructor() {
		this.engine = Matter.Engine.create({ gravity: { x: 0, y: 0 } });
		this.entities = new Map<number, Matter.Body>();
		this.id = 0;

		this.initMap();
		this.initCollisions();
	}

	// HELPERS - INITIALIZATION

	private initMap() {
		// TODO
	}

	private initCollisions() {
		Matter.Events.on(this.engine, "collisionStart", this.onCollisionStart);
	}

	// HELPERS - COLLISIONS

	private onCollisionStart(event: Matter.IEventCollision<Matter.Engine>) {
		const pairs = event.pairs;

		for (const pair of pairs) {
			const bodyA = pair.bodyA;
			const bodyB = pair.bodyB;

			// broadcast collision event to room
			// using bodyA.plugin.id and bodyB.plugin.id
		}
	}

	// HELPERS - ENTITIES

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
		entity.plugin.id = this.id;
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
			if (
				entity.pos.x !== gameEntity.position.x ||
				entity.pos.y !== gameEntity.position.y
			) {
				entity.pos.x = gameEntity.position.x;
				entity.pos.y = gameEntity.position.y;

				changed = true;
			}

			if (
				entity.velocity.x !== gameEntity.velocity.x ||
				entity.velocity.y !== gameEntity.velocity.y
			) {
				entity.velocity.x = gameEntity.velocity.x;
				entity.velocity.y = gameEntity.velocity.y;

				changed = true;
			}

			if (entity.rotation !== gameEntity.angle) {
				entity.rotation = gameEntity.angle;

				changed = true;
			}

			if (
				entity.type === EntityType.PLAYER &&
				(entity as Player).drunkiness > 0
			) {
				const player = entity as Player;
				player.drunkiness -= GameEngine.DRUNKINESS_LOSS;
				changed = true;
			}

			if (changed) {
				stateEntities.set(id, entity);
			}
		}
	}

	// METHODS - ENTITIES

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
			x: x + dx * GameEngine.PLAYER_RADIUS * 0.8,
			y: y + dy * GameEngine.PLAYER_RADIUS * 0.8,
			r,
			velX: dx * GameEngine.PROJECTILE_SPEED,
			velY: dy * GameEngine.PROJECTILE_SPEED,
			radius: GameEngine.PROJECTILE_RADIUS,
		});
		entity.frictionAir = 0;
		entity.plugin.lifetime = GameEngine.PROJECTILE_LIFETIME;

		return this.id;
	}

	removeEntity(id: number) {
		const entity = this.entities.get(id);
		if (!entity) return;

		if (
			Matter.Composite.get(this.engine.world, entity.id, entity.type) !==
			null
		) {
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

	handleMove({
		id,
		speed,
		x,
		y,
	}: {
		id: number;
		speed: number;
		x: number;
		y: number;
	}) {
		const entity = this.entities.get(id);
		Matter.Body.setVelocity(entity, { x: x * speed, y: y * speed });
	}

	handleRotation({ id, r }: { id: number; r: number }) {
		const entity = this.entities.get(id);
		Matter.Body.setAngle(entity, r);
	}
}
