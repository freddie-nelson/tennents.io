import Vec2 from "./Vec2";

import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";

export default class Entity {
  constructor(
    public readonly id: number,
    public pos: Vec2,
    public rotation: number,
    public velocity: Vec2,
    public type: EntityType
  ) {}
}
