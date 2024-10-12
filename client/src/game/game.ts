import { Application, Container } from "pixi.js";
import Entity from "./Entity";
import { Room } from "../api/colyseus";
import { Entity as ServerEntity } from "../../../server/src/rooms/schema/Entity";
import { Player as ServerPlayer } from "../../../server/src/rooms/schema/Player";
import { Healing as ServerHealing } from "../../../server/src/rooms/schema/Healing";
import { Weapon as ServerWeapon } from "../../../server/src/rooms/schema/Weapon";
import { Projectile as ServerProjectile } from "../../../server/src/rooms/schema/Projectile";
import Vec2 from "./Vec2";
import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import Player from "./Player";
import Healing from "./Healing";
import Weapon from "./Weapon";
import Projectile from "./Projectile";
import { GameState } from "../../../server/src/rooms/schema/GameState";

export const gameContainer = document.querySelector(".game") as HTMLElement;

export default class Game {
  public readonly app: Application;
  public readonly world: Container = new Container();
  public readonly entities: Map<number, Entity> = new Map();
  public you: Player | null = null;
  public readonly room: Room;

  constructor(room: Room) {
    this.app = new Application();
    this.room = room;
  }

  async init() {
    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    this.app.resizeTo = gameContainer;

    document.body.appendChild(this.app.canvas);

    window.addEventListener("resize", () => {
      this.app.resize();
    });

    this.app.stage.addChild(this.world);

    this.app.ticker.add(this.update.bind(this));

    this.room.onStateChange((state) => {
      this.syncEntities(state);

      const playerEntityId = state.players[this.room.sessionId];
      this.you = (this.entities.get(playerEntityId) as Player) ?? null;
    });

    this.app.start();
  }

  private update() {
    const dt = this.app.ticker.deltaTime;

    this.world.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

    for (const e of this.entities.values()) {
      e.update(dt);
    }

    if (this.you) {
      this.world.pivot.set(this.you.pos.x, this.you.pos.y);
    }
  }

  private syncEntities(state: GameState) {
    const stateEntities = new Map<number, ServerEntity>();
    for (const e of state.entities) {
      stateEntities.set(e.id, e);
    }

    for (const [id, e] of this.entities) {
      if (!stateEntities.has(id)) {
        if (e.sprite) this.world.removeChild(e.sprite);

        this.entities.delete(id);
      }
    }

    const worldSprites = new Set(this.world.children);

    for (const e of state.entities) {
      if (!this.entities.has(e.id)) {
        this.createEntity(e);
      } else {
        this.updateEntity(e);
      }

      const entity = this.entities.get(e.id)!;
      if (entity.sprite && !worldSprites.has(entity.sprite)) {
        this.world.addChild(entity.sprite);
      }
    }
  }

  private updateEntity(entity: ServerEntity) {
    const e = this.entities.get(entity.id);
    if (!e) {
      return;
    }

    e.pos = new Vec2(entity.pos.x, entity.pos.y);
    e.rotation = entity.rotation;
    e.velocity = new Vec2(entity.velocity.x, entity.velocity.y);
    e.type = entity.type;

    switch (e.type) {
      case EntityType.PLAYER:
        const p = e as Player;
        const serverPlayer = entity as ServerPlayer;
        p.drunkiness = serverPlayer.drunkiness;
        p.canPickup = serverPlayer.canPickup;
        p.healing = serverPlayer.healing;
        p.skin = serverPlayer.skin;
        p.weapon = serverPlayer.weapon;
        break;

      case EntityType.HEALING:
        const h = e as Healing;
        h.healingType = (entity as ServerHealing).healingType;
        break;

      case EntityType.WEAPON:
        const w = e as Weapon;
        w.weaponType = (entity as ServerWeapon).weaponType;
        break;

      case EntityType.PROJECTILE:
        const pr = e as Projectile;
        pr.projectileType = (entity as ServerProjectile).projectileType;
        break;

      default:
        throw new Error("Unknown entity type");
    }
  }

  private createEntity(entity: ServerEntity) {
    switch (entity.type) {
      case EntityType.PLAYER:
        const p = new Player(
          entity.id,
          new Vec2(entity.pos.x, entity.pos.y),
          entity.rotation,
          new Vec2(entity.velocity.x, entity.velocity.y),
          entity.type
        );

        const serverPlayer = entity as ServerPlayer;
        p.drunkiness = serverPlayer.drunkiness;
        p.canPickup = serverPlayer.canPickup;
        p.healing = serverPlayer.healing;
        p.skin = serverPlayer.skin;
        p.weapon = serverPlayer.weapon;

        return p;

      case EntityType.HEALING:
        const h = new Healing(
          entity.id,
          new Vec2(entity.pos.x, entity.pos.y),
          entity.rotation,
          new Vec2(entity.velocity.x, entity.velocity.y),
          entity.type
        );

        h.healingType = (entity as ServerHealing).healingType;

        return h;

      case EntityType.WEAPON:
        const w = new Weapon(
          entity.id,
          new Vec2(entity.pos.x, entity.pos.y),
          entity.rotation,
          new Vec2(entity.velocity.x, entity.velocity.y),
          entity.type
        );

        w.weaponType = (entity as ServerWeapon).weaponType;

        return w;

      case EntityType.PROJECTILE:
        const pr = new Projectile(
          entity.id,
          new Vec2(entity.pos.x, entity.pos.y),
          entity.rotation,
          new Vec2(entity.velocity.x, entity.velocity.y),
          entity.type
        );

        pr.projectileType = (entity as ServerProjectile).projectileType;

        return pr;

      default:
        throw new Error("Unknown entity type");
    }
  }
}
