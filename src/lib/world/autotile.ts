import { MapLayer } from '@/types/map';
import { TemplateTileType, Tileset } from '@/types/tileset';
import { RECT_AUTOTILE_MAP, RECT_AUTOTILE_MAP_MASK, WATER_AUTOTILE_MAP, WATER_AUTOTILE_MAP_MASK } from './autotile-map';
import * as tilemap from './tilemap';
import * as tilesetUtils from './tileset';
import { Point } from '@/types/geometry';

const SAME_TILE_N = 1024,
  SAME_TILE_W = 256,
  SAME_TILE_E = 64,
  SAME_TILE_S = 16,
  DEEP_TILE_N = 2048,
  DEEP_TILE_W = 512,
  DEEP_TILE_E = 128,
  DEEP_TILE_S = 32,
  SAME_TILE_NW = 8,
  SAME_TILE_NE = 4,
  SAME_TILE_SW = 2,
  SAME_TILE_SE = 1;

function matchTerrain(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number,
  cmpX: number, cmpY: number, newTileTemplateValue: number): number {
  const sourceTile = tilemap.getTemplateTile(layer.templateData[y * w + x], tileset),
    surroundingTile = tilemap.getTemplateTile(layer.templateData[cmpY * w + cmpX], tileset);

  if (cmpX < 0 || cmpX >= w || cmpY < 0 || cmpY >= h) {
    return 1;
  }

  if (layer.templateData[cmpY * w + cmpX] === newTileTemplateValue) {
    return 1;
  }

  if (sourceTile.terrain && surroundingTile.terrain && sourceTile.terrain === surroundingTile.terrain) {
    return 1;
  }

  return 0;
}

function matchWater(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number, cmpX: number,
  cmpY: number, newTileTemplateValue: number): number {
  const sourceTile = tilemap.getTemplateTile(newTileTemplateValue, tileset),
    surroundingTile = tilemap.getTemplateTile(layer.templateData[cmpY * w + cmpX], tileset);

  if (cmpX < 0 || cmpX >= w || cmpY < 0 || cmpY >= h) {
    return 1;
  }

  if (layer.templateData[cmpY * w + cmpX] === newTileTemplateValue) {
    return 1;
  }

  if (surroundingTile.type === TemplateTileType.DEEP_WATER) {
    return 2;
  }

  return 0;
}

function getAdjacencyMask(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number,
  newTileTemplateValue: number, matchFunc: Function): number {
  let mask = 0;

  const match = (cx: number, cy: number) => matchFunc(layer, tileset, x, y, w, h, cx, cy, newTileTemplateValue),
    matchN = match(x, y - 1),
    matchW = match(x - 1, y),
    matchE = match(x + 1, y),
    matchS = match(x, y + 1);

  if (matchN === 1) {
    mask = mask | SAME_TILE_N;
  }
  else if (matchN === 1) {
    mask = mask | DEEP_TILE_N;
  }

  if (matchW === 1) {
    mask = mask | SAME_TILE_W;
  }
  else if (matchW === 1) {
    mask = mask | DEEP_TILE_W;
  }

  if (matchE === 1) {
    mask = mask | SAME_TILE_E;
  }
  else if (matchE === 1) {
    mask = mask | DEEP_TILE_E;
  }

  if (matchS === 1) {
    mask = mask | SAME_TILE_S;
  }
  else if (matchS === 1) {
    mask = mask | DEEP_TILE_S;
  }

  if (match(x - 1, y - 1) > 0) {
    mask = mask | SAME_TILE_NW;
  }

  if (match(x + 1, y - 1) > 0) {
    mask = mask | SAME_TILE_NE;
  }

  if (match(x - 1, y + 1) > 0) {
    mask = mask | SAME_TILE_SW;
  }

  if (match(x + 1, y + 1) > 0) {
    mask = mask | SAME_TILE_SE;
  }

  return mask;
}

export function getRectangularTileIndex(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number,
  templateTileValue: number) {
  const mask: number = getAdjacencyMask(layer, tileset, x, y, w, h, templateTileValue, matchTerrain),
    nwesBits: number = (mask & 4080) >> 4,
    maskValue = RECT_AUTOTILE_MAP_MASK[nwesBits],
    diagBits = (mask & 0xF) & maskValue,
    normalizedMask = (nwesBits << 4) | diagBits;

  return RECT_AUTOTILE_MAP[normalizedMask];
}

export function getWaterTileIndex(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number,
  templateTileValue: number) {
  const mask: number = getAdjacencyMask(layer, tileset, x, y, w, h, templateTileValue, matchWater),
    nwesBits: number = (mask & 4080) >> 4,
    maskValue = WATER_AUTOTILE_MAP_MASK[nwesBits],
    diagBits = (mask & 0xF) & maskValue,
    normalizedMask = (nwesBits << 4) | diagBits;

  return WATER_AUTOTILE_MAP[normalizedMask];
}

export function calculateTileValue(layer: MapLayer, tileset: Tileset, x: number, y: number, w: number, h: number,
  templateTileValue: number): number {
  const templateTile = tilemap.getTemplateTile(templateTileValue, tileset),
    templateTileVal = tilemap.unpackMapBuf(templateTileValue),
    sectionId = templateTileVal[0];

  let tileIndex;

  if (layer.id > 0 && templateTileVal[1] === 0) {
    return tilemap.packMapBuf(sectionId, 0);
  }

  switch (templateTile.type) {
    case TemplateTileType.SINGLE:
      return tilemap.packMapBuf(sectionId, tilesetUtils.getFirstTile(templateTile.tile));

    case TemplateTileType.RECTANGULAR:
      tileIndex = getRectangularTileIndex(layer, tileset, x, y, w, h, templateTileValue);
      return Array.isArray(templateTile.tile) ? templateTile.tile[tileIndex] : 0;

    case TemplateTileType.WATER:
      tileIndex = getWaterTileIndex(layer, tileset, x, y, w, h, templateTileValue);
      return Array.isArray(templateTile.tile) ? templateTile.tile[tileIndex] : 0;

    case TemplateTileType.DEEP_WATER:
      return -1;
  }
}

export function visitSurroundingTiles(x: number, y: number, w: number, h: number, mapW: number, mapH: number,
  visitorCallback: Function) {
  const callInBounds = (ix: number, iy: number) => {
    if (ix >= 0 && ix < mapW && iy >= 0 && iy < mapW) {
      visitorCallback(ix, iy);
    }
  };

  // Start with top edge
  for (let i = x - 1; i <= x + w; i++) {
    callInBounds(i, y - 1);
  }

  // Bottom edge
  for (let i = x - 1; i <= x + w; i++) {
    callInBounds(i, y + h);
  }

  // Left edge
  for (let i = y; i < y + h; i++) {
    callInBounds(x - 1, i);
  }

  // Right edge
  for (let i = y; i < y + h; i++) {
    callInBounds(x + w, i);
  }
}

export function getSurroundingTiles(x: number, y: number, w: number, h: number, mapW: number, mapH: number, l: number): Point[] {
  const changes: Point[] = [];

  visitSurroundingTiles(x, y, w, h, mapW, mapH, (tx: number, ty: number) => {
    changes.push({ x: tx, y: ty, l });
  });

  return changes;
}

export function getAllTiles(x: number, y: number, w: number, h: number, mapW: number, mapH: number, l: number): Point[] {
  const changes: Point[] = getSurroundingTiles(x, y, w, h, mapW, mapH, l);

  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      changes.push({ x: px, y: py, l });
    }
  }

  return changes;
}