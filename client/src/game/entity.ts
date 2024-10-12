import Vec2 from "./Vec2";

import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import { Sprite } from "pixi.js";
import Textures from "./Textures";
import Player from "./Player";
import Weapon from "./Weapon";
import Healing from "./Healing";
import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";
import Projectile from "./Projectile";

export default class Entity {
	public sprite: Sprite | null = null;
	private spriteType: EntityType | null = null;

	constructor(
		public readonly id: number,
		public pos: Vec2,
		public rotation: number,
		public velocity: Vec2,
		public type: EntityType
	) {}

	update(dt: number) {
		if (!this.sprite || this.spriteType !== this.type) {
			this.createSprite();
		}

		// this.pos.x += this.velocity.x * dt;
		// this.pos.y += this.velocity.y * dt;

		this.sprite!.position.set(this.pos.x, this.pos.y);
		this.sprite!.rotation = this.rotation;
	}

	createSprite() {
		this.sprite = new Sprite();
		this.sprite.anchor.set(0.5);
		this.sprite.position.set(this.pos.x, this.pos.y);
		this.sprite.rotation = this.rotation;

		let subType: any;
		if (this.type === EntityType.WEAPON) {
			subType = (this as any as Weapon).weaponType;
		} else if (this.type === EntityType.PROJECTILE) {
			subType = (this as any as Projectile).projectileType;
		} else if (this.type === EntityType.HEALING) {
			subType = (this as any as Healing).healingType;
		}

		const size = Entity.getSize(this.type, subType);
		this.sprite.width = size.x;
		this.sprite.height = size.y;

		this.spriteType = this.type;

		switch (this.type) {
			case EntityType.PLAYER:
				this.sprite.texture = Textures.getPlayerTexture(
					(this as any as Player).skin
				);
				break;
			case EntityType.HEALING:
				this.sprite.texture = Textures.getHealingTexture(
					(this as any as Healing).healingType
				);
				break;
			case EntityType.WEAPON:
			case EntityType.PROJECTILE:
				this.sprite.texture = Textures.getWeaponTexture(
					(this as any as Weapon).weaponType
				);
				break;

			default:
				throw new Error("Unknown entity type");
		}

		if (this.type === EntityType.PLAYER) {
			const p = this as any as Player;

			if (p.weapon !== undefined) {
				const weaponSprite = new Sprite();
				weaponSprite.anchor.set(0.5);
				weaponSprite.position.set(
					this.sprite.width * 1.5,
					this.sprite.height * 1.5
				);
				weaponSprite.texture = Textures.getWeaponTexture(p.weapon);
				weaponSprite.rotation = Math.PI * 1.2;

				const size = Entity.getSize(EntityType.WEAPON, p.weapon).mul(4);
				weaponSprite.width = size.x;
				weaponSprite.height = size.y;

				this.sprite.addChild(weaponSprite);
			}

			if (p.healing !== undefined) {
				const healingSprite = new Sprite();
				healingSprite.anchor.set(0.5);
				healingSprite.position.set(
					-this.sprite.width * 1.5,
					this.sprite.height * 1.5
				);
				healingSprite.texture = Textures.getHealingTexture(p.healing);

				const size = Entity.getSize(EntityType.HEALING, p.healing).mul(
					4
				);
				healingSprite.width = size.x;
				healingSprite.height = size.y;

				this.sprite.addChild(healingSprite);
			}
		}
	}

	static getSize(type: EntityType, subType?: any): Vec2 {
		switch (type) {
			case EntityType.PLAYER:
				return new Vec2(100, 80);

			case EntityType.WEAPON:
				subType = subType as WeaponType;

				switch (subType) {
					case WeaponType.TENNENTS_LIGHT:
						return new Vec2(30, 40);
					case WeaponType.TENNENTS_PINT:
						return new Vec2(30, 40);
					case WeaponType.TENNENTS_ORIGINAL:
						return new Vec2(30, 40);
					case WeaponType.TENNENTS_SUPER:
						return new Vec2(30, 40);
					case WeaponType.TENNENTS_KEG:
						return new Vec2(30, 40);

					default:
						throw new Error("Unknown weapon type");
				}
			case EntityType.PROJECTILE:
				subType = subType as WeaponType;

				switch (subType) {
					case WeaponType.TENNENTS_LIGHT:
						return new Vec2(10, 10);
					case WeaponType.TENNENTS_PINT:
						return new Vec2(10, 10);
					case WeaponType.TENNENTS_ORIGINAL:
						return new Vec2(10, 10);
					case WeaponType.TENNENTS_SUPER:
						return new Vec2(10, 10);
					case WeaponType.TENNENTS_KEG:
						return new Vec2(10, 10);

					default:
						throw new Error("Unknown weapon type");
				}

			case EntityType.HEALING:
				subType = subType as HealingType;

				switch (subType) {
					case HealingType.TENNENTS_ZERO:
						return new Vec2(30, 30);
					case HealingType.WATER:
						return new Vec2(30, 30);
					case HealingType.COFFEE:
						return new Vec2(30, 30);
					case HealingType.ORANGE_JUICE:
						return new Vec2(30, 30);
					case HealingType.DONER_KEBAB:
						return new Vec2(30, 30);

					default:
						throw new Error("Unknown healing type");
				}

			default:
				throw new Error("Unknown entity type");
		}
	}
}
