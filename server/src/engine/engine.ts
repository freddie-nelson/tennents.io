import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";

import { Entity } from "../rooms/schema/Entity";

export class GameEngine {
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

	// GENERAL

	addEntity(x: number, y: number, radius: number): number {
		this.id++;

		const entity = Matter.Bodies.circle(x, y, radius);
		entity.frictionAir = 0.1;
		this.entities.set(this.id, entity);
		Matter.Composite.add(this.engine.world, entity);

		return this.id;
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

			entity.pos.x = gameEntity.position.x;
			entity.pos.y = gameEntity.position.y;

			entity.velocity.x = gameEntity.velocity.x;
			entity.velocity.y = gameEntity.velocity.y;

			entity.rotation = gameEntity.angle;
		}
	}

	// EVENT HANDLERS

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
