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
	// client.sessionId -> entity.id
	private playerClients: Map<string, number> = new Map();

	onCreate(options: any) {
		this.engine.initMap();

		this.setState(new GameState());
		this.engine.updateEntities(this.state.entities);

		this.setPatchRate(1000 / 30);
		this.onBeforePatch = () => {
			this.engine.updateEntities(this.state.entities);
		};

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

		// map client to room entities player entity index
		this.playerClients.set(client.sessionId, id);

		// create room state entity
		const pos = new Vector();
		GameRoom.updateVector(pos, 0, 0);
		const velocity = new Vector();
		GameRoom.updateVector(velocity, 0, 0);
		const player = new Player();
		GameRoom.updateEntity(player, id, EntityType.PLAYER, pos, velocity, 0);
		GameRoom.updatePlayer(
			player,
			options.name,
			WeaponType.TENNENTS_LIGHT,
			0,
			PlayerSkinType.RED
		);

		// add to room state entities
		this.state.entities.set(`${player.id}`, player);
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");

		const id = this.playerClients.get(client.sessionId);

		// remove entity from game state entities
		this.engine.removeEntity(id);

		// remove entity from room state entities
		this.state.entities.delete(`${id}`);

		// update playerClients mapping
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
