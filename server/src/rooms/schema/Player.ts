import { type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { WeaponType } from "./enums/WeaponType";
import { HealingType } from "./enums/HealingType";
import { PlayerSkinType } from "./enums/PlayerSkinType";

export class Player extends Entity {
	@type("string") name: string;
	@type("int8") weapon: WeaponType;
	@type("int32") drunkiness: number;
	@type("int8") skin: PlayerSkinType;
	@type("int8") healing?: HealingType;
	@type("int64") canPickup?: number;
	@type("boolean") alive: boolean;
}
