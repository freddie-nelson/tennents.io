import { TileType } from "./enums/TileType";

export class GameTile {
	x: number;
	y: number;
	type: TileType;
	isCollidable: boolean;
	isPlayerSpawn: boolean;
	isCrate: boolean;
	isPickupSpawn: boolean;

	constructor(
		x: number,
		y: number,
		type: TileType,
		isCollidable: boolean,
		isPlayerSpawn: boolean,
		isCrate: boolean,
		isPickupSpawn: boolean
	) {
		this.x = x;
		this.y = y;
		this.type = type;
		this.isCollidable = isCollidable;
		this.isPlayerSpawn = isPlayerSpawn;
		this.isCrate = isCrate;
		this.isPickupSpawn = isPickupSpawn;
	}
}
