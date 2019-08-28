import { MapLayer } from "@/types/map";

const RECT_AUTOTILE_MAP_MASK: Record<number,number> = {
  0: 0,
  64: 0,
  16: 0,
  80: 8,
  4: 0,
  68: 4,
  20: 0,
  84: 12,
  1: 0,
  65: 0,
  17: 2,
  81: 10,
  5: 1,
  69: 5,
  21: 3,
  85: 15,
};

const RECT_AUTOTILE_MAP: Record<number,number> = {
  0: 47,
  1024: 44,
  256: 46,
  1280: 40,
  1288: 9,
  64: 45,
  1088: 36,
  1092: 7,
  320: 41,
  1344: 39,
  1348: 37,
  1352: 38,
  1356: 8,
  16: 43,
  1040: 42,
  272: 14,
  274: 3,
  1296: 35,
  1298: 33,
  1304: 34,
  1306: 6,
  80: 10,
  81: 1,
  1104: 17,
  1105: 15,
  1108: 16,
  1109: 4,
  336: 13,
  337: 11,
  338: 12,
  339: 2,
  1360: 32,
  1361: 28,
  1362: 26,
  1363: 22,
  1364: 30,
  1365: 23,
  1366: 24,
  1367: 18,
  1368: 31,
  1369: 25,
  1370: 26,
  1371: 19,
  1372: 27,
  1373: 20,
  1374: 21,
  1375: 5,
}

const SAME_TILE_N = 1024,
  SAME_TILE_W = 256,
  SAME_TILE_E = 64,
  SAME_TILE_S = 16,
  WATER_TILE_N = 2048,
  WATER_TILE_W = 512,
  WATER_TILE_E = 128,
  WATER_TILE_S = 32,
  SAME_TILE_NW = 8,
  SAME_TILE_NE = 4,
  SAME_TILE_SW = 2,
  SAME_TILE_SE = 1;

function getAdjacencyMask(layer: MapLayer, x: number, y: number, w: number, h: number, tileValue: number): number {
  let mask = 0;
  const leftEdge = x - 1 < 0,
    rightEdge = x + 1 >= w,
    topEdge = y - 1 < 0,
    bottomEdge = y + 1 >= h;

  if (leftEdge || layer.templateData[y * w + (x - 1)] == tileValue) {
    mask = mask | SAME_TILE_W;
  }
  if (leftEdge || topEdge || layer.templateData[(y - 1) * w + (x - 1)] == tileValue) {
    mask = mask | SAME_TILE_NW;
  }
  if (leftEdge || bottomEdge || layer.templateData[(y + 1) * w + (x - 1)] == tileValue) {
    mask = mask | SAME_TILE_SW;
  }
  if (topEdge || layer.templateData[(y - 1) * w + x] == tileValue) {
    mask = mask | SAME_TILE_N;
  }
  if (topEdge || rightEdge || layer.templateData[(y - 1) * w + (x + 1)] == tileValue) {
    mask = mask | SAME_TILE_NE;
  }
  if (rightEdge || layer.templateData[y * w + (x + 1)] == tileValue) {
    mask = mask | SAME_TILE_E;
  }
  if (bottomEdge || rightEdge || layer.templateData[(y + 1) * w + (x + 1)] == tileValue) {
    mask = mask | SAME_TILE_SE;
  }
  if ( bottomEdge || layer.templateData[(y + 1) * w + x] == tileValue) {
    mask = mask | SAME_TILE_S;
  }

  return mask;
}

export function getRectangularTileIndex(layer: MapLayer, x: number, y: number, w: number, h: number, templateTileValue: number) {
  const mask: number = getAdjacencyMask(layer, x, y, w, h, templateTileValue),
    nwesBits: number = (mask & 4080) >> 4,
    maskValue = RECT_AUTOTILE_MAP_MASK[nwesBits],
    diagBits = (mask & 0xF) & maskValue,
    normalizedMask = (nwesBits << 4) | diagBits;

  return RECT_AUTOTILE_MAP[normalizedMask];
}

export function visitSurroundingTiles(x: number, y: number, w: number, h: number, mapW: number, mapH: number, visitorCallback: Function) {
  const callInBounds = (ix: number, iy: number) => {
    if ( ix >= 0 && ix < mapW && iy >= 0 && iy < mapW ) {
      visitorCallback(ix, iy);
    }
  }

  // Start with top edge
  for(let i = x - 1; i <= x + w; i++) {
    callInBounds(i, y - 1);
  }

  // Bottom edge
  for(let i = x - 1; i <= x + w; i++) {
    callInBounds(i, y + h);
  }

  // Left edge
  for(let i = y; i < y + h; i++) {
    callInBounds(x - 1, i);
  }

  // Right edge
  for(let i = y; i < y + h; i++) {
    callInBounds(x + w, i);
  }
}
