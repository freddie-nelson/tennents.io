import * as Colyseus from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";
import { MessageType as MessageTypeServer } from "../../../server/src/rooms/schema/enums/MessageType";
import { GameStateType } from "../../../server/src/rooms/schema/enums/GameStateType";

export type Room = Colyseus.Room<GameState>;
export type MessageType = MessageTypeServer;

const SERVER_URL =
	process.env.NODE_ENV === "production"
		? "https://server.tennents.io"
		: "ws://localhost:2567";

export class API {
	private client: Colyseus.Client;

	constructor() {
		this.client = new Colyseus.Client(SERVER_URL);
	}

	async joinOrCreate(name: string) {
		const rooms = await this.client.getAvailableRooms("room");
		const availableRooms = rooms.filter((room) => room.metadata.joinable);

		if (availableRooms.length > 0) {
			return this.client.joinById<GameState>(availableRooms[0].roomId, {
				name,
			});
		}

		// create new lobby is no available rooms
		return this.client.create<GameState>("room", { name });
	}
}
