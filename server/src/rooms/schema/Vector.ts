import { Schema, type } from "@colyseus/schema";

export class Vector extends Schema {
	@type("float32") x: number;
	@type("float32") y: number;
}
