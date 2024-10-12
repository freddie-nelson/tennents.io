import { Room, Client } from "@colyseus/core";
import { GameState } from "./schema/GameState";
import { Player } from "./schema/Player";
import { MessageType } from "./schema/enums/MessageType";
import { Engine } from "../engine/engine";

export class MyRoom extends Room<GameState> {
	public maxClients: number = 10;
	private engine: Engine = new Engine();

	onCreate(options: { name: string }) {
		this.setState(new GameState());

		this.onMessage(MessageType.MOVE, (client, message) => {});
		this.onMessage(MessageType.ROTATE, (client, message) => {});
		this.onMessage(MessageType.HEAL, (client, message) => {});
		this.onMessage(MessageType.SHOOT, (client, message) => {});
		this.onMessage(MessageType.PICKUP, (client, message) => {});
	}

	onJoin(client: Client, options: { name: string }) {
		console.log(client.sessionId, "joined!");
		// TODO - Create a player entity in the engine
		this.state.entities.set(client.sessionId, new Player());
	}

	onLeave(client: Client, consented: boolean) {
		console.log(client.sessionId, "left!");
	}

	onDispose() {
		console.log("room", this.roomId, "disposing...");
		this.engine.dispose();
	}
}
