import Matter from "matter-js";

export class Engine {
	private engine: Matter.Engine = Matter.Engine.create();
	private entities: Map<number, Matter.Body> = new Map<number, Matter.Body>();

	addEntity(id: number, x: number, y: number, radius: number) {
		const entity = Matter.Bodies.circle(x, y, radius);
		this.entities.set(id, entity);
		Matter.Composite.add(this.engine.world, entity);
	}

	removeEntity(id: number) {
		const entity = this.entities.get(id);
		Matter.Composite.remove(this.engine.world, entity);
	}
}
