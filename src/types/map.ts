import { Tileset, TemplateTile } from './tileset';
import { TileSize } from './geometry';

export enum ToolType {
  PENCIL = 0,
  FILL,
  RECTANGLE,
}

export interface TileSelection {
  w: number;
  h: number;
  tileIndices: number[];
  fromMap?: boolean;
}

export interface MapLayer {
  id: number;
  templateData: Uint16Array;
  visibleData: Uint16Array;
}

export interface TileMap {
  title: string;
  w: number;
  h: number;
  buffer: ArrayBuffer;
  layer: MapLayer[];
  tileset: Tileset;
  lastUpdated: Date;
}

export interface TileMapTree {
  id: string;
  title: string;
  children: TileMapTree[];
}

export interface MapView {
  map: TileMap;
  tileset: Tileset;
  tileSize: TileSize;
  tool: ToolType;
  tileSelection: TileSelection;
  curSection: number;
}

export interface TileDraw {
  x: number;
  y: number;
  l: number;
  w: number;
  h: number;
  data: TileDrawData[];
}

export interface TileDrawData {
  s: number;
  t: number;
}

export interface TileChangeEntry {
  l: number;
  x: number;
  y: number;
  pt: number;
  pv: number;
  v: number;
  t: number;
}

export interface TileChange {
  entries: TileChangeEntry[];
}

