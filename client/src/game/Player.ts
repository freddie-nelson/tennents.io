import Entity from "./Entity";

import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";
import { PlayerSkinType } from "../../../server/src/rooms/schema/enums/PlayerSkinType";

export default class Player extends Entity {
  public name: string = "John";
  public weapon: WeaponType = WeaponType.TENNENTS_LIGHT;
  public healing?: HealingType;
  public drunkiness: number = 0;
  public skin: PlayerSkinType = PlayerSkinType.RED;
  public canPickup?: number;
}
