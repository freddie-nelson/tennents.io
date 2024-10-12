import { Room, Client } from "@colyseus/core";

import { GameEngine } from "../engine/engine";

import { WeaponType } from "./schema/enums/WeaponType";
import { HealingType } from "./schema/enums/HealingType";
import { PlayerSkinType } from "./schema/enums/PlayerSkinType";
import { EntityType } from "./schema/enums/EntityType";
import { MessageType } from "./schema/enums/MessageType";
import { GameStateType } from "./schema/enums/GameStateType";

import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";
import { Entity } from "./schema/Entity";
import { Vector } from "./schema/Vector";
import { GameConfig } from "./schema/GameConfig";
import { Projectile } from "./schema/Projectiles";
import { Healing } from "./schema/Healing";
import { Weapon } from "./schema/Weapon";

import { getHealingAmountFromHealingType } from "../rules/healing";
import { getDrunkinessAmountFromWeaponType } from "../rules/weapon";

export class GameRoom extends Room<GameState> {
  maxClients = 10;
  private TIME_TO_START = 3;
  private timeToStartInterval: NodeJS.Timeout | undefined;
  private playersToStart = 1;
  private engine: GameEngine = new GameEngine(this.onCollisionStart.bind(this));
  private playerClients: Map<string, number> = new Map(); // client.sessionId -> entity.id

  onCreate(options: any) {
    this.setState(new GameState());

    this.setPatchRate(1000 / 30);
    this.onBeforePatch = () => {
      if (this.state.state === GameStateType.STARTED) {
        this.engine.update(this.clock.deltaTime, this.state.entities);
        this.updateClosestPickups();
      }
    };

    this.state.config = new GameConfig();
    this.state.config.maxDrunkiness = 100;
    this.state.config.maxPlayers = this.maxClients;
    this.state.config.playerSpeed = GameEngine.PLAYER_SPEED;
    this.state.config.playersToStart = this.playersToStart;
    this.state.state = GameStateType.WAITING;

    this.createPickups();

    // EVENT HANDLERS

    this.onMessage(MessageType.MOVE, (client, message) => {
      // console.log(
      //   `received MessageType.MOVE | client.sessionId - ${client.sessionId} | message - ${message}`
      // );

      /**
       * message
       * {x: number, y: number}
       */
      this.engine.handleMove({
        id: this.playerClients.get(client.sessionId),
        speed: this.state.config.playerSpeed,
        x: message.x,
        y: message.y,
      });
    });

    this.onMessage(MessageType.ROTATE, (client, message) => {
      // console.log(
      //   `received MessageType.ROTATE | client.sessionId - ${client.sessionId} | message - ${message}`
      // );

      /**
       * message
       * {r: number}
       */
      this.engine.handleRotation({
        id: this.playerClients.get(client.sessionId),
        r: message.r,
      });
    });

    this.onMessage(MessageType.HEAL, (client, message) => {
      // console.log(
      //   `received MessageType.HEAL | client.sessionId - ${client.sessionId} | message - ${message}`
      // );

      /**
       * message
       * null
       */
      const entity = <Player>this.state.entities.get(`${this.playerClients.get(client.sessionId)}`);
      if (entity.healing === undefined) {
        return;
      }

      entity.drunkiness = Math.max(0, entity.drunkiness - getHealingAmountFromHealingType(entity.healing));
      entity.healing = undefined;
    });

    this.onMessage(MessageType.SHOOT, (client, message) => {
      // console.log(
      //   `received MessageType.SHOOT | client.sessionId - ${client.sessionId} | message - ${message}`
      // );

      /**
       * message
       * null
       */
      const player = <Player>this.state.entities.get(`${this.playerClients.get(client.sessionId)}`);

      const projectileId = this.engine.addProjectile({
        x: player.pos.x,
        y: player.pos.y,
        r: player.rotation,
        ownerId: player.id,
      });

      const projectile = new Projectile();
      const projectilePos = new Vector();
      GameRoom.updateVector(projectilePos, player.pos.x, player.pos.y);
      GameRoom.updateEntity(
        projectile,
        projectileId,
        EntityType.PROJECTILE,
        projectilePos,
        new Vector(),
        player.rotation
      );
      GameRoom.updateProjectile({
        projectile,
        projectileType: player.weapon,
      });

      this.state.entities.set(`${projectile.id}`, projectile);
    });

    this.onMessage(MessageType.PICKUP, (client, message) => {
      console.log(
        `received MessageType.PICKUP | client.sessionId - ${client.sessionId} | message - ${message}`
      );

      /**
       * message
       * null
       */
      const player = <Player>this.state.entities.get(`${this.playerClients.get(client.sessionId)}`);

      if (player.canPickup === undefined) {
        return;
      }

      const entity = this.state.entities.get(`${player.canPickup}`);
      if (!entity) return;

      if (entity.type === EntityType.HEALING) {
        player.healing = (<Healing>entity).healingType;
      } else if (entity.type === EntityType.WEAPON) {
        player.weapon = (<Weapon>entity).weaponType;
      }

      // destroy the entity of the floor
      this.engine.removeEntity(player.canPickup);
      this.state.entities.delete(`${player.canPickup}`);

      player.canPickup = undefined;
    });
  }

  onJoin(client: Client, options: { name: string }) {
    console.log(client.sessionId, "joined!");

    if (this.state.state === GameStateType.STARTED || this.state.state === GameStateType.ENDED) {
      client.leave();
      return;
    }

    if (this.clients.length >= this.playersToStart && this.timeToStartInterval === undefined) {
      this.state.timeToStart = this.TIME_TO_START;
      this.state.state = GameStateType.STARTING;
      this.timeToStartInterval = setInterval(() => {
        this.state.timeToStart--;
        if (this.state.timeToStart === 0) {
          clearInterval(this.timeToStartInterval);
          this.timeToStartInterval = undefined;
          this.state.state = GameStateType.STARTED;
        }
      }, 1000);
    }

    const playerSpawn = this.engine.getSpawnableTile();
    const id = this.engine.addPlayer({
      x: playerSpawn.x,
      y: playerSpawn.y,
      r: 0,
    });

    const player = new Player();
    GameRoom.updateEntity(player, id, EntityType.PLAYER, new Vector(), new Vector(), 0);
    GameRoom.updatePlayer(player, options.name, WeaponType.TENNENTS_LIGHT, 0, this.clients.length - 1);

    this.state.entities.set(`${player.id}`, player);
    this.state.players.set(client.sessionId, player.id);

    this.playerClients.set(client.sessionId, player.id);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    const id = this.playerClients.get(client.sessionId);

    this.engine.removeEntity(id);

    this.state.entities.delete(`${id}`);
    this.state.players.delete(client.sessionId);

    this.playerClients.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");

    this.engine.dispose();
  }

  updateClosestPickups() {
    const playerIds = Array.from(this.playerClients.values());

    for (const playerId of playerIds) {
      const player = <Player>this.state.entities.get(`${playerId}`);
      const closestPickupId = this.engine.findClosestPickupEntity(playerId);

      if (closestPickupId === null) {
        player.canPickup = undefined;
        continue;
      }

      player.canPickup = closestPickupId;
    }
  }

  // COLLISIONS

  private onCollisionStart(event: Matter.IEventCollision<Matter.Engine>) {
    const pairs = event.pairs;

    for (const pair of pairs) {
      const bodyA = pair.bodyA;
      const bodyB = pair.bodyB;

      // bodyA is player
      // bodyB is projectile
      if (bodyA.plugin.type === EntityType.PLAYER && bodyB.plugin.type === EntityType.PROJECTILE) {
        if (bodyA.plugin.id === bodyB.plugin.ownerId) continue;
        this.handlePlayerProjectileCollision(bodyA.plugin.id, bodyB.plugin.id);
        continue;
      }

      // bodyA is projectile
      // bodyB is player
      if (bodyB.plugin.type === EntityType.PLAYER && bodyA.plugin.type === EntityType.PROJECTILE) {
        if (bodyB.plugin.id === bodyA.plugin.ownerId) continue;
        this.handlePlayerProjectileCollision(bodyB.plugin.id, bodyA.plugin.id);
        continue;
      }

      if (bodyA.plugin.type === EntityType.PROJECTILE) {
        this.engine.removeEntity(bodyA.plugin.id);
        this.state.entities.delete(`${bodyA.plugin.id}`);
        continue;
      }

      if (bodyB.plugin.type === EntityType.PROJECTILE) {
        this.engine.removeEntity(bodyB.plugin.id);
        this.state.entities.delete(`${bodyB.plugin.id}`);
        continue;
      }

      // TODO
    }
  }

  // HELPERS - RULES

  handlePlayerProjectileCollision(playerId: number, projectileId: number) {
    const player = <Player>this.state.entities.get(`${playerId}`);
    const projectile = <Projectile>this.state.entities.get(`${projectileId}`);

    // remove player health
    const drunkinessAmount = getDrunkinessAmountFromWeaponType(projectile.projectileType);
    player.drunkiness += drunkinessAmount;
    if (player.drunkiness >= this.state.config.maxDrunkiness) {
      this.engine.removeEntity(playerId);
      this.state.entities.delete(`${playerId}`);
    }

    // remove projectile
    this.engine.removeEntity(projectileId);
    this.state.entities.delete(`${projectileId}`);
  }

  // HELPERS - UPDATE

  createPickups() {
    this.engine.pickupSpawnableTiles.forEach((tile) => {
      const type = Math.random() > 0.5 ? EntityType.WEAPON : EntityType.HEALING;
      const entity = this.engine.addPickup({
        x: tile.x,
        y: tile.y,
        type,
      });

      if (type === EntityType.HEALING) {
        const healing = new Healing();
        GameRoom.updateEntity(healing, entity, type, new Vector(), new Vector(), 0);
        healing.healingType = this.randomEnum(HealingType);
        this.state.entities.set(`${healing.id}`, healing);
      } else if (type === EntityType.WEAPON) {
        const weapon = new Weapon();
        GameRoom.updateEntity(weapon, entity, type, new Vector(), new Vector(), 0);
        weapon.weaponType = this.randomEnum(WeaponType);
        this.state.entities.set(`${weapon.id}`, weapon);
      }
    });
  }

  randomEnum<T>(anEnum: T): T[keyof T] {
    const values = Object.values(anEnum).filter((v) => typeof v === "number");
    return values[Math.floor(Math.random() * values.length)] as any;
  }

  static updateVector(vector: Vector, x: number, y: number) {
    vector.x = x;
    vector.y = y;
  }

  static updateEntity(
    entity: Entity,
    id: number,
    type: EntityType,
    pos: Vector,
    velocity: Vector,
    rotation: number
  ) {
    entity.id = id;
    entity.type = type;
    entity.pos = pos;
    entity.velocity = velocity;
    entity.rotation = rotation;
  }

  static updatePlayer(
    player: Player,
    name: string,
    weapon: WeaponType,
    drunkiness: number,
    skin: PlayerSkinType,
    healing?: HealingType,
    canPickup?: number
  ) {
    player.name = name;
    player.weapon = weapon;
    player.drunkiness = drunkiness;
    player.skin = skin;
    player.healing = healing;
    player.canPickup = canPickup;
  }

  static updateProjectile({
    projectile,
    projectileType,
  }: {
    projectile: Projectile;
    projectileType: WeaponType;
  }) {
    projectile.projectileType = projectileType;
  }
}
