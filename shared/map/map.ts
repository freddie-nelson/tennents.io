import { GameTile } from "./tile";
import { TileType } from "./enums/TileType";

export class GameMap {
  tiles: GameTile[];
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;

  constructor(tilemapData: any) {
    this.width = tilemapData.width;
    this.height = tilemapData.height;
    this.tileWidth = tilemapData.tilewidth;
    this.tileHeight = tilemapData.tileheight;
    this.tiles = this.processTiles(tilemapData);
  }

  private processTiles(tilemapData: any): GameTile[] {
    const tiles: GameTile[] = [];
    const layer = tilemapData.layers[0];

    for (let i = 0; i < layer.data.length; i++) {
      const tileId = layer.data[i];
      if (tileId > 0) {
        // Ignore empty tiles (ID 0)
        const x = i % this.width;
        const y = Math.floor(i / this.width);

        const type = tileId as TileType;

        const isCollidable = this.isCollidableTile(type);
        const isPlayerSpawn = this.isPlayerSpawnTile(type);
        const isCrate = this.isCrateTile(type);
        const isPickupSpawn = this.isPickupSpawnTile(type);

        tiles.push(new GameTile(x, y, type, isCollidable, isPlayerSpawn, isCrate, isPickupSpawn));
      }
    }
    return tiles;
  }

  private isCollidableTile(type: TileType): boolean {
    if (
      type === TileType.WOODEN_FLOOR ||
      type === TileType.STONE_TILE ||
      type === TileType.SINK ||
      type === TileType.ELEVATOR_LEFT ||
      type === TileType.ELEVATOR_RIGHT ||
      type === TileType.COBBLESTONE
    ) {
      return false;
    }

    return true;
  }

  private isPlayerSpawnTile(type: TileType): boolean {
    if (type === TileType.COBBLESTONE || type === TileType.WOODEN_FLOOR || type === TileType.SINK) {
      return Math.random() < 0.5;
    }

    return false;
  }

  private isCrateTile(type: TileType): boolean {
    return false;
  }

  private isPickupSpawnTile(type: TileType): boolean {
    if (
      type === TileType.POOL_BOTTOM_LEFT ||
      type === TileType.POOL_BOTTOM_RIGHT ||
      type === TileType.POOL_LEFT ||
      type === TileType.POOL_RIGHT ||
      type === TileType.POOL_TOP_LEFT ||
      type === TileType.POOL_TOP_RIGHT ||
      type === TileType.TABLE_SIDE ||
      type === TileType.TABLE_UP ||
      type === TileType.TOILET ||
      type === TileType.BAR_DOWN ||
      type === TileType.BAR_LEFT ||
      type === TileType.BAR_LEFT_DRAUGHT ||
      type === TileType.BAR_RIGHT ||
      type === TileType.BAR_RIGHT_DRAGHT ||
      type === TileType.BAR_UP
    ) {
      return Math.random() < 0.3;
    }

    if (type === TileType.WOODEN_FLOOR || type === TileType.COBBLESTONE) {
      return Math.random() < 0.001;
    }

    return false;
  }
}

// Function to load the tilemap JSON from a URL
export async function loadTilemap(url: string): Promise<GameMap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load tilemap: ${response.statusText}`);
  }
  const tilemapData = await response.json();
  return new GameMap(tilemapData);
}
