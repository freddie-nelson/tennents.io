import { type } from "@colyseus/schema";
import { Entity } from "./Entity";
import { WeaponType } from "./enums/WeaponType";

export class Projectile extends Entity {
	@type("int8") projectileType: WeaponType;
}
