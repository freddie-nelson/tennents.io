import { Schema, type } from "@colyseus/schema";

export class GameConfig extends Schema {
  @type("int32") maxDrunkiness: number;
  @type("int32") maxPlayers: number;
  @type("int32") playerSpeed: number;
}
