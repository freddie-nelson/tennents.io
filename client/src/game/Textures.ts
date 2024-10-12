import { Assets, Texture } from "pixi.js";
import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import { PlayerSkinType } from "../../../server/src/rooms/schema/enums/PlayerSkinType";

export default abstract class Textures {
  private static textures = new Map<string, Texture>();

  static async initTextures() {
    const playerColors = [
      PlayerSkinType.RED,
      PlayerSkinType.GREEN,
      PlayerSkinType.BLUE,
      PlayerSkinType.YELLOW,
      PlayerSkinType.PURPLE,
      PlayerSkinType.ORANGE,
      PlayerSkinType.PINK,
      PlayerSkinType.CYAN,
      PlayerSkinType.GRAY,
      PlayerSkinType.LIME,
    ];

    for (const color of playerColors) {
      const key = PlayerSkinType[color][0] + PlayerSkinType[color].toLowerCase().slice(1);
      const texture = await Assets.load(`/images/Players/${key}Player.svg`);
      this.textures.set(`player_${color}`, texture);
    }
  }

  static getTexture(entityType: EntityType): Texture {
    if (!this.textures.has(entityType.toString())) {
      throw new Error(`Texture for ${entityType} not found`);
    }

    return this.textures.get(entityType.toString())!;
  }

  static getPlayerTexture(skin: PlayerSkinType): Texture {
    const key = `player_${skin}`;
    if (!this.textures.has(key)) {
      throw new Error(`Texture for ${skin} not found`);
    }

    return this.textures.get(key)!;
  }
}
