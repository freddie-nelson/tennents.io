import { type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { WeaponType } from "./enums/WeaponType";

export class Weapon extends Entity {
	@type("int8") weaponType: WeaponType;
}
