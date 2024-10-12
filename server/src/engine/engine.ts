import Matter from "matter-js";
import { MapSchema } from "@colyseus/schema";
import { Entity } from "../rooms/schema/Entity";
import { GameRoom } from "../rooms/GameRoom";

export class GameEngine {
	private static PLAYER_RADIUS: number = 1;

	private engine: Matter.Engine = Matter.Engine.create();
	private entities: Map<number, Matter.Body> = new Map<number, Matter.Body>();
	private id: number = 0;

	addEntity(x: number, y: number, radius: number): number {
		this.id++;
		const entity = Matter.Bodies.circle(x, y, radius);
		this.entities.set(this.id, entity);
		Matter.Composite.add(this.engine.world, entity);
		return this.id;
	}

	removeEntity(id: number) {
		const entity = this.entities.get(id);
		Matter.Composite.remove(this.engine.world, entity);
	}

	dispose() {
		Matter.World.clear(this.engine.world, false);
		Matter.Engine.clear(this.engine);
	}

	initMap() {}

	addPlayer(): number {
		return this.addEntity(0, 0, GameEngine.PLAYER_RADIUS);
	}

	updateEntities(stateEntities: MapSchema<Entity, string>) {
		for (const [id, entity] of stateEntities) {
			const gameEntity = this.entities.get(parseInt(id));
			GameRoom.updateVector(
				entity.pos,
				gameEntity.position.x,
				gameEntity.position.y
			);
			GameRoom.updateVector(
				entity.velocity,
				gameEntity.velocity.x,
				gameEntity.velocity.y
			);
			entity.rotation = gameEntity.angle;
		}
	}
}
