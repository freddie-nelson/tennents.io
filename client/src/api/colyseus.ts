import * as Colyseus from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";
import { MessageType as MessageTypeServer } from "../../../server/src/rooms/schema/enums/MessageType";

export type Room = Colyseus.Room<GameState>;
export type MessageType = MessageTypeServer;

export class API {
  private client: Colyseus.Client;

  constructor() {
    this.client = new Colyseus.Client("ws://localhost:2567");
  }

  joinOrCreate() {
    return this.client.joinOrCreate<GameState>("room");
  }
}
