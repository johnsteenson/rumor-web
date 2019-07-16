
export interface Dimension {
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TileSize {
  w: number;
  h: number;
  scaledW: number;
  scaledH: number;
  scale: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  t: number;
  r: number;
  b: number;
  l: number;
}

export type Nullable<T> = T | null;
