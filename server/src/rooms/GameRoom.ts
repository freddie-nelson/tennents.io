import { Room, Client } from "@colyseus/core";
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";
import { MessageType } from "./schema/enums/MessageType";
import { GameEngine } from "../engine/engine";

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

		const player = new Player();
		const id = this.engine.addPlayer();
		player.id = id;

		this.playerClients.set(client, this.state.entities.length); // map client to player entity index
		this.state.entities.push(player);
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");

		const id = this.playerClients.get(client);
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");

		this.engine.dispose();
	}
}
