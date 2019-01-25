import { Dimension } from './primitives';

// Max tiles: 2000

export enum TileType {
  SINGLE = 1,
  RECTANGULAR,
}

export interface TileAnim {
  t: number[];
}

export interface Tile {
  type: TileType;
  tiles: TileAnim[];
}

export interface Tileset {
  name: string;
  imageFile: string;

  tilesPerRow: number;
  tileSize: Dimension;

  tiles: Tile[];
}


