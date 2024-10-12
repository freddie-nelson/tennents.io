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

import { getHealingAmountFromHealingType } from "../rules/healing";
import { GameConfig } from "./schema/GameConfig";

export class GameRoom extends Room<GameState> {
  private static PLAYER_RADIUS: number = 1;

  maxClients = 10;
  private engine: GameEngine = new GameEngine();
  private playerClients: Map<string, number> = new Map(); // client.sessionId -> entity.id

  onCreate(options: any) {
    this.setState(new GameState());
    this.engine.updateStateEntities(this.state.entities);

    this.setPatchRate(1000 / 30);
    this.onBeforePatch = () => {
      this.engine.updateStateEntities(this.state.entities);
    };

    this.state.config = new GameConfig();
    this.state.config.maxDrunkiness = 100;
    this.state.config.maxPlayers = this.maxClients;
    this.state.config.playerSpeed = 0.25;

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
      entity.drunkiness -= getHealingAmountFromHealingType(entity.healing);
      entity.healing = null;
    });

    this.onMessage(MessageType.SHOOT, (client, message) => {
      console.log(
        `received MessageType.SHOOT | client.sessionId - ${client.sessionId} | message - ${message}`
      );

      /**
       * message
       * null
       */
      // TODO
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

    const id = this.engine.addEntity(0, 0, GameRoom.PLAYER_RADIUS);

    const pos = new Vector();
    GameRoom.updateVector(pos, 0, 0);
    const velocity = new Vector();
    GameRoom.updateVector(velocity, 0, 0);
    const player = new Player();
    GameRoom.updateEntity(player, id, EntityType.PLAYER, pos, velocity, 0);
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
}
