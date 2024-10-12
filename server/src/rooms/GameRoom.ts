import { Room, Client } from "@colyseus/core";
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";
import { MessageType } from "./schema/enums/MessageType";
import { GameEngine } from "../engine/engine";
import { EntityType } from "./schema/enums/EntityType";
import { Entity } from "./schema/Entity";
import { Vector } from "./schema/Vector";
import { WeaponType } from "./schema/enums/WeaponType";
import { HealingType } from "./schema/enums/HealingType";
import { PlayerSkinType } from "./schema/enums/PlayerSkinType";

export class GameRoom extends Room<GameState> {
  maxClients = 10;

  private engine: GameEngine = new GameEngine();
  private playerClients: Map<Client, number> = new Map();

  onCreate(options: { name: string }) {
    this.engine.initMap();

    this.setState(new GameState());

    this.onMessage(MessageType.MOVE, (client, message) => {});
    this.onMessage(MessageType.ROTATE, (client, message) => {});
    this.onMessage(MessageType.HEAL, (client, message) => {});
    this.onMessage(MessageType.SHOOT, (client, message) => {});
    this.onMessage(MessageType.PICKUP, (client, message) => {});
  }

  onJoin(client: Client, options: { name: string }) {
    console.log(client.sessionId, "joined!");

    // add to game engine entities
    const id = this.engine.addPlayer();

    // create room state entity
    const pos = new Vector();
    this.updateVector(pos, 0, 0);
    const velocity = new Vector();
    this.updateVector(velocity, 0, 0);
    const player = new Player();
    this.updateEntity(player, id, EntityType.PLAYER, pos, velocity, 0);
    this.updatePlayer(player, options.name, WeaponType.TENNENTS_LIGHT, 0, PlayerSkinType.RED);

    // add to room state entities
    this.state.entities.push(player);

    // map client to room entities player entity index
    this.playerClients.set(client, this.state.entities.length);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    const index = this.playerClients.get(client);
    const player = this.state.entities[index];

    // remove entity from room state entities
    this.state.entities.deleteAt(index);

    // update playerClients mapping

    // remove entity from game state entities
    this.engine.removeEntity(player.id);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");

    this.engine.dispose();
  }

  // Update Entities

  private updateVector(vector: Vector, x: number, y: number) {
    vector.x = x;
    vector.y = y;
  }

  private updateEntity(
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

  private updatePlayer(
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
