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
  l?: number;
}

export interface Rect {
  t: number;
  r: number;
  b: number;
  l: number;
}

export interface ScrollRect {
  innerL: number;
  innerR: number;
  outerL: number;
  outerR: number;
  innerT: number;
  innerB: number;
  outerT: number;
  outerB: number;
};

export interface TileDrawRect {
  tile: Rect;
  offset: Point;
}

export enum Axis {
  HORIZONTAL = 1,
  VERTICAL
};

