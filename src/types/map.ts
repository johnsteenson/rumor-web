import { Tileset } from './tileset';
import { TileSize } from './primitives';

export enum ToolType {
  PENCIL = 1,
  FILL,
  RECTANGLE,
}

export interface TileSelection {
  w: number;
  h: number;
  tileIndices: number[];
}

export interface MapLayer {
  data: Uint16Array;
  visibleData: Uint16Array;
}

export interface TileMap {
  title: string;
  w: number;
  h: number;
  buffer: ArrayBuffer;
  layer: MapLayer[];
  lastUpdated: Date;
}

export interface MapView {
  map: TileMap;
  tileset: Tileset;
  tileSize: TileSize;
  tool: ToolType;
  tileSelection: TileSelection;
  curSection: number;
}

export interface TileChangeEntry {
  l: number;
  x: number;
  y: number;
  p: number;
  pv: number;
  v: number;
}

export interface TileChange {
  entries: TileChangeEntry[];
}

