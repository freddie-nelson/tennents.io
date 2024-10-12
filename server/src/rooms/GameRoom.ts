import { Room, Client } from "@colyseus/core";

import { GameEngine } from "../engine/engine";

import { WeaponType } from "./schema/enums/WeaponType";
import { HealingType } from "./schema/enums/HealingType";
import { PlayerSkinType } from "./schema/enums/PlayerSkinType";
import { EntityType } from "./schema/enums/EntityType";
import { MessageType } from "./schema/enums/MessageType";

import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";
import { Entity } from "./schema/Entity";
import { Vector } from "./schema/Vector";
import { GameConfig } from "./schema/GameConfig";
import { Projectile } from "./schema/projectile";

import { getHealingAmountFromHealingType } from "../rules/healing";
import { GameStateType } from "./schema/enums/GameStateType";

export class GameRoom extends Room<GameState> {
  maxClients = 10;
  private TIME_TO_START = 10;
  private timeToStartInterval: NodeJS.Timeout | undefined;
  private playersToStart = 1;
  private engine: GameEngine = new GameEngine();
  private playerClients: Map<string, number> = new Map(); // client.sessionId -> entity.id

  onCreate(options: any) {
    this.setState(new GameState());

    this.setPatchRate(1000 / 30);
    this.onBeforePatch = () => {
      if (this.state.state === GameStateType.STARTED) {
        this.engine.update(this.clock.deltaTime, this.state.entities);
      }
    };

    this.state.config = new GameConfig();
    this.state.config.maxDrunkiness = 100;
    this.state.config.maxPlayers = this.maxClients;
    this.state.config.playerSpeed = GameEngine.PLAYER_SPEED;
    this.state.config.playersToStart = this.playersToStart;
    this.state.state = GameStateType.WAITING;

    // EVENT HANDLERS

    this.onMessage(MessageType.MOVE, (client, message) => {
      console.log(
        `received MessageType.MOVE | client.sessionId - ${client.sessionId} | message - ${message}`
      );

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
      console.log(
        `received MessageType.ROTATE | client.sessionId - ${client.sessionId} | message - ${message}`
      );

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
      console.log(
        `received MessageType.HEAL | client.sessionId - ${client.sessionId} | message - ${message}`
      );

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
      console.log(
        `received MessageType.SHOOT | client.sessionId - ${client.sessionId} | message - ${message}`
      );

      /**
       * message
       * null
       */
      const player = <Player>this.state.entities.get(`${this.playerClients.get(client.sessionId)}`);

      const projectileId = this.engine.addProjectile({
        x: player.pos.x,
        y: player.pos.y,
        r: player.rotation,
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
       */
      // TODO
    });
  }

  onJoin(client: Client, options: { name: string }) {
    console.log(client.sessionId, "joined!");

    if (this.state.state !== GameStateType.WAITING && this.state.state !== GameStateType.STARTING) {
      client.leave();
      return;
    }

    if (this.clients.length >= this.playersToStart && this.timeToStartInterval === undefined) {
      this.state.state = GameStateType.STARTING;
      this.state.timeToStart = this.TIME_TO_START;

      this.timeToStartInterval = setInterval(() => {
        this.state.timeToStart -= 1;

        if (this.state.timeToStart <= 0) {
          clearInterval(this.timeToStartInterval);
          this.state.state = GameStateType.STARTED;
        }
      }, 1000);
    }

    const id = this.engine.addPlayer({
      x: 0,
      y: 0,
      r: 0,
    });

    const player = new Player();
    GameRoom.updateEntity(player, id, EntityType.PLAYER, new Vector(), new Vector(), 0);
    GameRoom.updatePlayer(player, options.name, WeaponType.TENNENTS_LIGHT, 0, PlayerSkinType.RED);

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

    if (this.clients.length < 2) {
      this.disconnect();
    }
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");

    this.engine.dispose();
  }

  // Update Entities

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
