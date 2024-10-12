import { type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { HealingType } from "./enums/HealingType";

export class Healing extends Entity {
	@type("int8") healingType: HealingType;
}
