import { Assets, Texture } from "pixi.js";
import { PlayerSkinType } from "../../../server/src/rooms/schema/enums/PlayerSkinType";
import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";
import { TileType } from "../../../shared/map/enums/TileType";

export default abstract class Textures {
  public static textures = new Map<string, Texture>();

  static async initTextures() {
    const playerColors = Object.values(PlayerSkinType).filter((c) => typeof c !== "string");

    for (const color of playerColors) {
      const key = PlayerSkinType[color][0] + PlayerSkinType[color].toLowerCase().slice(1);
      const texture: Texture = await Assets.load(`/images/Players/${key}Player.svg`);
      this.textures.set(`player_${color}`, texture);
    }

    const weaponTypes = Object.values(WeaponType).filter((t) => typeof t !== "string");
    for (const type of weaponTypes) {
      const key = WeaponType[type];
      const texture = await Assets.load(`/images/Attack/${key}.svg`);
      this.textures.set(key, texture);
    }

    const healingTypes = Object.values(HealingType).filter((t) => typeof t !== "string");
    for (const type of healingTypes) {
      const key = HealingType[type];
      const texture = await Assets.load(`/images/Heal/${key}.svg`);
      this.textures.set(key, texture);
    }

    const tileTypes = Object.values(TileType).filter((t) => typeof t !== "string");
    for (const type of tileTypes) {
      const key = TileType[type];
      const texture = await Assets.load(`/images/Tileset/${key}.png`);
      this.textures.set(key, texture);
    }
  }

  static getWeaponTexture(weaponType: WeaponType): Texture {
    const key = WeaponType[weaponType];
    if (!this.textures.has(key)) {
      throw new Error(`Texture for ${weaponType} not found`);
    }

    return this.textures.get(key)!;
  }

  static getHealingTexture(healingType: HealingType): Texture {
    const key = HealingType[healingType];
    if (!this.textures.has(key)) {
      throw new Error(`Texture for ${healingType} not found`);
    }

    return this.textures.get(key)!;
  }

  static getPlayerTexture(skin: PlayerSkinType): Texture {
    const key = `player_${skin}`;
    if (!this.textures.has(key)) {
      throw new Error(`Texture for ${skin} not found`);
    }

    return this.textures.get(key)!;
  }
}
