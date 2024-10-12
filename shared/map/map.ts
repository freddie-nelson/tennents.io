import { GameTile } from './tile'; 
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
      if (tileId > 0) { // Ignore empty tiles (ID 0)
        const x = (i % this.width) * this.tileWidth;
        const y = Math.floor(i / this.width) * this.tileHeight;

        
        const isCollidable = this.isCollidableTile(tileId);
        const isPlayerSpawn = this.isPlayerSpawnTile(tileId);
        const isCrate = this.isCrateTile(tileId);
        const isPickupSpawn = this.isPickupSpawnTile(tileId);

        
        tiles.push(new GameTile(x, y, tileId, isCollidable, isPlayerSpawn, isCrate, isPickupSpawn));
      }
    }
    return tiles;
  }

  private mapTileIdToTileType(tileId: number): TileType {
    switch (tileId) {
      case 1:
        return TileType.Floor;
      case 2:
        return TileType.Wall;
      case 3:
        return TileType.PlayerSpawn;
      case 4:
        return TileType.Crate;
      case 5:
        return TileType.PickupSpawn;
      default:
        return TileType.Floor; 
    }
  }
    
  private isCollidableTile(type: TileType): boolean {
    return type === TileType.Wall; // Walls are collidable
  }

  private isPlayerSpawnTile(type: TileType): boolean {
    return type === TileType.PlayerSpawn; // Player spawn points
  }

  private isCrateTile(type: TileType): boolean {
    return type === TileType.Crate; // Crates - maybe redundant?
  }

  private isPickupSpawnTile(type: TileType): boolean {
    return type === TileType.PickupSpawn; // Pickup spawn points
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


loadTilemap('shared/map/mapproject.json')
  .then((gameMap) => {
    console.log('Parsed GameMap:', gameMap.tiles);
  })
  .catch((error) => {
    console.error('Error loading tilemap:', error);
  });
