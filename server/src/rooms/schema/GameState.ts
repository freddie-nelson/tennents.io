import { ArraySchema, Schema, type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { GameStateType } from "./enums/GameStateType";
import { GameConfig } from "./GameConfig";

export class GameState extends Schema {
  @type("int64") id: number;
  @type({ map: Entity }) entities: ArraySchema<Entity> = new ArraySchema<Entity>();
  @type("int32") playerCount: number;
  @type("int32") timeToStart: number;
  @type("int8") state: GameStateType;
  @type(GameConfig) config: GameConfig;
}
