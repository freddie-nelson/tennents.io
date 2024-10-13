import { Assets, Texture } from "pixi.js";
import { PlayerSkinType } from "../../../server/src/rooms/schema/enums/PlayerSkinType";
import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";
import { TileType } from "../../../shared/map/enums/TileType";

export default abstract class Textures {
  public static textures = new Map<string, Texture>();

  static async initTextures() {
    const promises: Promise<any>[] = [];

    const playerColors: PlayerSkinType[] = Object.values(PlayerSkinType).filter((c) => typeof c !== "string");
    for (const color of playerColors) {
      const key = PlayerSkinType[color][0] + PlayerSkinType[color].toLowerCase().slice(1);
      promises.push(
        Assets.load(`/images/Players/${key}Player.svg`).then((t) => {
          this.textures.set(`player_${color}`, t);
        })
      );
    }

    const weaponTypes = Object.values(WeaponType).filter((t) => typeof t !== "string");
    for (const type of weaponTypes) {
      const key = WeaponType[type];
      promises.push(
        Assets.load(`/images/Attack/${key}.svg`).then((t) => {
          this.textures.set(key, t);
        })
      );
    }

    const healingTypes = Object.values(HealingType).filter((t) => typeof t !== "string");
    for (const type of healingTypes) {
      const key = HealingType[type];
      promises.push(
        Assets.load(`/images/Heal/${key}.svg`).then((t) => {
          this.textures.set(key, t);
        })
      );
    }

    const tileTypes = Object.values(TileType).filter((t) => typeof t !== "string");
    for (const type of tileTypes) {
      const key = TileType[type];
      promises.push(
        Assets.load(`/images/Tileset/${key}.png`).then((t) => {
          this.textures.set(key, t);
        })
      );
    }

    await Promise.all(promises);
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
