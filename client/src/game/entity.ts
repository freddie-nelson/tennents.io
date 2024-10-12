import Vec2 from "./Vec2";

import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import { Sprite } from "pixi.js";
import Textures from "./Textures";
import Player from "./Player";

export default class Entity {
  private sprite: Sprite | null = null;
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

    this.pos.x += this.velocity.x * dt;
    this.pos.y += this.velocity.y * dt;

    this.sprite!.position.set(this.pos.x, this.pos.y);
    this.sprite!.rotation = this.rotation;
  }

  private createSprite() {
    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(this.pos.x, this.pos.y);
    this.sprite.rotation = this.rotation;

    this.spriteType = this.type;

    if (this.type === EntityType.PLAYER) {
      this.sprite.texture = Textures.getPlayerTexture((this as any as Player).skin);
    } else {
      this.sprite.texture = Textures.getTexture(this.type);
    }
  }
}
