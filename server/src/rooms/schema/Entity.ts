import { Schema, type } from "@colyseus/schema";
import { EntityType } from "./enums/EntityType";
import { Vector } from "./Vector";

export class Entity extends Schema {
	@type("int64") id: number;
	@type("int8") type: EntityType;
	@type(Vector) pos: Vector;
	@type(Vector) velocity: Vector;
	@type("float32") rotation: number;
}
