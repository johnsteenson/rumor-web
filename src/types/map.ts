
export enum ToolType {
  PENCIL = 1,
  FILL,
  RECTANGLE,
}

export interface Tool {
  type: ToolType;
  selectedTiles: number[];
}

export interface MapLayer {
  tiles: Uint16Array;
}

export interface Map {
  title: string;
  w: number;
  h: number;
  buffer: ArrayBuffer;
  layer: MapLayer[];
}
