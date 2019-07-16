import { Dimension, TileSize } from './primitives';
import { ToolType, TileSelection } from './map';

export enum TileType {
  SINGLE = 1,
  RECTANGULAR,
}

export type TileAnim = number[] | number;

export interface Tile {
  type: TileType;
  tile: TileAnim[];
}

export interface TilesetSection {
  imageFile: string;
  tilesPerRow: number;
  totalRows: number;
  tiles: Tile[];
}

export interface Tileset {
  name: string;
  tileSize: Dimension;
  sections: TilesetSection[];
}

export interface TilesetView {
  tileset: Tileset;
  tileSize: TileSize;
  curSection: number;
  tool: ToolType;
  tileSelection: TileSelection;
};

