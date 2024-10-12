import * as Colyseus from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";
import { MessageType as MessageTypeServer } from "../../../server/src/rooms/schema/enums/MessageType";

export type Room = Colyseus.Room<GameState>;
export type MessageType = MessageTypeServer;

const SERVER_URL =
  process.env.NODE_ENV === "production" ? "https://server.tennents.io" : "ws://localhost:2567";

export class API {
  private client: Colyseus.Client;

  constructor() {
    this.client = new Colyseus.Client(SERVER_URL);
  }

  joinOrCreate(name: string) {
    return this.client.joinOrCreate<GameState>("room", {
      name,
    });
  }
}
