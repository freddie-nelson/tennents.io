import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import Entity from "./entity";

export default class Weapon extends Entity {
  weaponType: WeaponType = WeaponType.TENNENTS_LIGHT;
}
