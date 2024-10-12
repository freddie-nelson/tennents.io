import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";
import Entity from "./entity";

export default class Healing extends Entity {
  healingType: HealingType = HealingType.TENNENTS_ZERO;
}
