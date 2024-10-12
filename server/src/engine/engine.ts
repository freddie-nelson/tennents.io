import Matter from "matter-js";

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

	// Methods

	initMap() {}

	addPlayer(): number {
		return this.addEntity(0, 0, GameEngine.PLAYER_RADIUS);
	}
}
