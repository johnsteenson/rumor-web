import { Dimension, TileSize } from './geometry';
import { ToolType, TileSelection } from './map';

export enum TileType {
  EMPTY = 0,
  SINGLE = 1,
  SINGLE_ANIM = 2,
  NW_CORNER = 3,
  NW_CORNER_ANIM = 4,
  NE_CORNER = 5,
  NE_CORNER_ANIM = 6,
  SW_CORNER = 7,
  SW_CORNER_ANIM = 8,
  SE_CORNER = 9,
  SE_CORNER_ANIM = 10,
}

export enum TemplateTileType {
  SINGLE = 0,
  RECTANGULAR = 1,
  WATER = 2,
  DEEP_WATER = 3,
}

export enum PassageType {
  COPY = 0,
  WALL = 1,
}

export type TileAnim = number[] | number;

export interface TemplateTile {
  type: TemplateTileType;
  passage: PassageType;
  terrain?: number;
  prop: number;
  tile: TileAnim;
}

export interface Tile {
  type: TileType;
  prop: number;
  t: TileAnim;
  flen?: number;
  quarter?: number;
}

export interface TilesetSection {
  imageFile: string;
  tilesPerRow: number;
  totalRows: number;
  templateTiles: TemplateTile[];
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
  curLayer: number;
}

export interface ToolView {
  tool: ToolType;
  tileSelection: TileSelection;
}

