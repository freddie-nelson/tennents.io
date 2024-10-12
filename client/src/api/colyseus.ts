import * as Colyseus from "colyseus.js";

export class API {
	private client: Colyseus.Client;

	constructor() {
		this.client = new Colyseus.Client("ws://localhost:2567");
	}

	async test() {
		console.log(await this.client.getAvailableRooms());
	}
}
