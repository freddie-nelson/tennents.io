import { MapSchema, Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { GameStateType } from "./enums/GameStateType";
import { GameConfig } from "./GameConfig";

export class GameState extends Schema {
	@type("int64") id: number;
	@type({ map: Entity }) entities: MapSchema<Entity> =
		new MapSchema<Entity>();
	@type("int32") playerCount: number;
	@type("int32") timeToStart: number;
	@type("int8") state: GameStateType;
	@type(GameConfig) config: GameConfig;
}
