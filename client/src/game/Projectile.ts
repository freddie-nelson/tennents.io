import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import Entity from "./entity";

export default class Projectile extends Entity {
  projectileType: WeaponType = WeaponType.TENNENTS_LIGHT;
}
