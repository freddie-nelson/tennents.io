import { Application, Container } from "pixi.js";
import Entity from "./entity";
import { Room } from "../api/colyseus";
import { Entity as ServerEntity } from "../../../server/src/rooms/schema/Entity";
import { Player as ServerPlayer } from "../../../server/src/rooms/schema/Player";
import { Healing as ServerHealing } from "../../../server/src/rooms/schema/Healing";
import { Weapon as ServerWeapon } from "../../../server/src/rooms/schema/Weapon";
import { Projectile as ServerProjectile } from "../../../server/src/rooms/schema/Projectiles";
import Vec2 from "./Vec2";
import { EntityType } from "../../../server/src/rooms/schema/enums/EntityType";
import Player from "./Player";
import Healing from "./Healing";
import Weapon from "./Weapon";
import Projectile from "./Projectile";
import { GameState } from "../../../server/src/rooms/schema/GameState";
import Textures from "./Textures";
import { MessageType } from "../../../server/src/rooms/schema/enums/MessageType";
import { GameStateType } from "../../../server/src/rooms/schema/enums/GameStateType";
import { SoundManager } from "./soundManager";
import { WeaponType } from "../../../server/src/rooms/schema/enums/WeaponType";
import { HealingType } from "../../../server/src/rooms/schema/enums/HealingType";

export const gameContainer = document.querySelector(".game") as HTMLElement;
export const startingContainer = document.querySelector(".starting") as HTMLElement;
export const startingContainerText = document.querySelector(".starting h1") as HTMLElement;

const key = new Map<string, boolean>();
window.addEventListener("keydown", (e) => {
  key.set(e.key, true);
});
window.addEventListener("keyup", (e) => {
  key.set(e.key, false);
});

const mousePos = new Vec2(0, 0);
let isMousePressed = false;

window.addEventListener("mousemove", (e) => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

window.addEventListener("mousedown", () => {
  isMousePressed = true;
});

window.addEventListener("mouseup", () => {
  isMousePressed = false;
});

const isKeyDown = (...k: string[]) =>
  typeof k === "string" ? key.get(k) ?? false : k.some((k) => key.get(k) ?? false);

export default class Game {
  public static readonly SCALE = 60;

  public readonly app: Application;
  public readonly world: Container = new Container();
  public readonly entities: Map<number, Entity> = new Map();
  public you: Player | null = null;
  public readonly room: Room;

  public onStageChanges: ((game: Game) => void)[] = [];
  public shootTimer: number = 0;

  constructor(room: Room) {
    this.app = new Application();
    this.room = room;
  }

  async init() {
    await Textures.initTextures();

    // Initialize sounds
    const soundManager = SoundManager.getInstance();
    soundManager.loadSound("keg", "client/public/SFX/Burp.mp3");
    soundManager.loadSound("tennentsSuper", "client/public/SFX/RAHHHH - Sound Effect [ ezmp3.cc ].mp3");
    soundManager.loadSound("tennentsClassic", "client/public/SFX/wine-glass-clink-36036.mp3");
    soundManager.loadSound("tennents", "client/public/SFX/opening-beer-can-6336.mp3");
    soundManager.loadSound("tennentsLite", "client/public/SFX/chug.mp3");

    soundManager.loadSound("veryHurt", "client/public/SFX/Metal pipe.mp3");
    soundManager.loadSound("hurtALot", "client/public/SFX/elite death sound.mp3");
    soundManager.loadSound(
      "hurtVeryMuch",
      "client/public/SFX/LEGO YODA DEATH SOUND EFFECT  STAR WARS [ ezmp3.cc ].mp3"
    );
    soundManager.loadSound(
      "hurtRatherBadly",
      "client/public/SFX/Roblox Death Sound (Oof) - Sound Effect (HD) [ ezmp3.cc ].mp3"
    );
    soundManager.loadSound(
      "hurt",
      "client/public/SFX/Minecraft Damage (Oof) - Sound Effect (HD) [ ezmp3.cc ].mp3"
    );

    soundManager.loadSound("kebab", "client/public/SFX/chewing.mp3");
    soundManager.loadSound("oj", "client/public/SFX/short-choir-6116.mp3");
    soundManager.loadSound("coffee", "client/public/SFX/coffee-pouring-243569.mp3");
    soundManager.loadSound("water", "client/public/SFX/short-choir-6116.mp3");
    soundManager.loadSound("tennentsZero", "client/public/SFX/tennents-zero.mp3");

    await this.app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      resizeTo: gameContainer,
      backgroundColor: "black",
    });

    document.body.appendChild(this.app.canvas);

    window.addEventListener("resize", () => {
      this.app.resize();
    });

    this.app.stage.addChild(this.world);
    this.app.stage.scale = Game.SCALE;

    this.app.ticker.add(() => this.update());

    this.room.onStateChange((state) => {
      this.sync(state);
      this.onStageChanges.forEach((cb) => cb(this));
    });
    this.sync(this.room.state);

    if (this.room.state.state !== GameStateType.STARTED) {
      startingContainer.style.display = "flex";
    }

    this.room.onLeave(() => {
      alert("You have been disconnected");
    });

    this.app.canvas.addEventListener("mousedown", (e) => {
      if (!this.you) {
        return;
      }

      if (e.button === 0) {
        // left click
        if (this.shootTimer > 0) {
          return;
        }

        this.shootTimer = 5;
        this.room.send(MessageType.SHOOT);

        // Play weapon sound based on the player's weapon
        const soundManager = SoundManager.getInstance();
        switch (this.you.weapon) {
          case WeaponType.TENNENTS_KEG:
            soundManager.playSound("keg");
            break;
          case WeaponType.TENNENTS_SUPER:
            soundManager.playSound("tennentsSuper");
            break;
          case WeaponType.TENNENTS_ORIGINAL:
            soundManager.playSound("tennentsClassic");
            break;
          case WeaponType.TENNENTS_PINT:
            soundManager.playSound("tennents");
            break;
          case WeaponType.TENNENTS_LIGHT:
            soundManager.playSound("tennentsLite");
            break;
          default:
            console.warn("Unknown weapon type");
        }
      } else if (e.button === 2) {
        // right click
        this.room.send(MessageType.HEAL);
        // Play healing sound based on the healing type
        switch (this.you.healing) {
          case HealingType.TENNENTS_ZERO:
            soundManager.playSound("tennentsZero");
            break;
          case HealingType.WATER:
            soundManager.playSound("water");
            break;
          case HealingType.COFFEE:
            soundManager.playSound("coffee");
            break;
          case HealingType.ORANGE_JUICE:
            soundManager.playSound("oj");
            break;
          case HealingType.DONER_KEBAB:
            soundManager.playSound("kebab");
            break;
          default:
            console.warn("Unknown healing type");
        }
      }
    });

    this.app.canvas.oncontextmenu = (e) => e.preventDefault();

    window.addEventListener("keydown", (e) => {
      if (e.key === "e") {
        this.room.send(MessageType.PICKUP);
      }
    });

    this.app.start();
  }

  onStageChange(cb: (game: Game) => void) {
    this.onStageChanges.push(cb);
  }

  private update() {
    if (startingContainer.style.display !== "none") {
      if (this.room.state.state === GameStateType.STARTED) {
        startingContainer.style.display = "none";
      } else if (this.room.state.state === GameStateType.WAITING) {
        startingContainerText.innerText = `Waiting for players... (${this.room.state.players.size}/${this.room.state.config.maxPlayers})`;
      } else if (this.room.state.state === GameStateType.STARTING) {
        startingContainerText.innerText = `Game starting in ${this.room.state.timeToStart} seconds (${this.room.state.players.size}/${this.room.state.config.maxPlayers})`;
      }
    }

    const dt = this.app.ticker.deltaTime;

    this.world.position.set(
      this.app.screen.width / 2 / this.app.stage.scale.x,
      this.app.screen.height / 2 / this.app.stage.scale.y
    );

    for (const e of this.entities.values()) {
      e.update(dt);
    }

    if (this.you) {
      this.world.pivot.set(this.you.pos.x, this.you.pos.y);
    }

    const worldSprites = new Set(this.world.children);
    for (const [id, e] of this.entities) {
      if (e.sprite && !worldSprites.has(e.sprite)) {
        this.world.addChild(e.sprite);
      }
    }

    this.shootTimer = Math.max(0, this.shootTimer - 1);

    this.handleMovement();
    this.handleRotation();
  }

  private handleMovement() {
    const moveVec = new Vec2(0, 0);
    if (isKeyDown("w", "ArrowUp")) {
      moveVec.y -= 1;
    }
    if (isKeyDown("s", "ArrowDown")) {
      moveVec.y += 1;
    }
    if (isKeyDown("a", "ArrowLeft")) {
      moveVec.x -= 1;
    }
    if (isKeyDown("d", "ArrowRight")) {
      moveVec.x += 1;
    }

    if (this.you && (moveVec.x !== 0 || moveVec.y !== 0)) {
      const drunkinessPercent = this.you.drunkiness / this.room.state.config.maxDrunkiness;

      if (drunkinessPercent > 0.3) {
        moveVec.mul(Math.random() * 0.2);
      } else if (drunkinessPercent > 0.6) {
        moveVec.mul(Math.random() * 0.4);
      } else if (drunkinessPercent > 0.8) {
        moveVec.mul(Math.random() * 0.7);
      }

      if (this.room.state.state !== GameStateType.STARTED) {
        return;
      }

      this.room.send(MessageType.MOVE, { x: moveVec.x, y: moveVec.y });
    }
  }

  private handleRotation() {
    if (this.you) {
      const dir = mousePos.sub(new Vec2(this.app.screen.width / 2, this.app.screen.height / 2)).normalize();
      const rotation = dir.angle();

      if (rotation === this.you.rotation || this.room.state.state !== GameStateType.STARTED) {
        return;
      }

      this.room.send(MessageType.ROTATE, { r: rotation });
    }
  }

  private sync(state: GameState) {
    this.syncEntities(state);

    const playerEntityId = state.players.get(this.room.sessionId)!;
    this.you = (this.entities.get(playerEntityId) as Player) ?? null;
  }

  private syncEntities(state: GameState) {
    const stateEntities = new Map<number, ServerEntity>();
    for (const [id, e] of state.entities) {
      stateEntities.set(e.id, e);
    }

    for (const [id, e] of this.entities) {
      if (!stateEntities.has(id)) {
        if (e.sprite) this.world.removeChild(e.sprite);

        this.entities.delete(id);
      }
    }

    for (const [id, e] of state.entities) {
      if (!this.entities.has(e.id)) {
        this.entities.set(e.id, this.createEntity(e));
      } else {
        this.updateEntity(e);
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
        p.name = serverPlayer.name;
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
        p.name = serverPlayer.name;
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
