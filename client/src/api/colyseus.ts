import * as Colyseus from "colyseus.js";

import { GameState } from "../../../server/src/rooms/schema/GameState";
import { MessageType as MessageTypeServer } from "../../../server/src/rooms/schema/enums/MessageType";
import { GameStateType } from "../../../server/src/rooms/schema/enums/GameStateType";

export type Room = Colyseus.Room<GameState>;
export type MessageType = MessageTypeServer;

const SERVER_URL =
  process.env.NODE_ENV === "production" ? "https://server.tennents.io" : `ws://${location.hostname}:2567`;

export class API {
  private client: Colyseus.Client;

  constructor() {
    this.client = new Colyseus.Client(SERVER_URL);
  }

  async joinOrCreate(name: string): Promise<Colyseus.Room<GameState>> {
    const rooms = await this.client.getAvailableRooms("room");
    const availableRooms = rooms.filter((room) => room.metadata.joinable);

    if (availableRooms.length > 0) {
      const room = await this.client.joinById<GameState>(availableRooms[0].roomId, {
        name,
      });

      const joined = await new Promise<boolean>((resolve) => {
        room.onMessage("failed-to-join", () => {
          room.removeAllListeners();
          resolve(false);
        });

        room.onMessage("joined-correctly", () => {
          resolve(true);
        });
      });

      return joined ? room : await this.joinOrCreate(name);
    }

    // create new lobby is no available rooms
    return await this.client.create<GameState>("room", { name });
  }
}
