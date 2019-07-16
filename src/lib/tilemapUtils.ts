import { MapLayer, TileMap } from "@/types/map";

const MAP_BYTE_SIZE = 2,
  LAYERS = 2;

function createLayers(w: number, h: number, totalLayers: number, buffer: ArrayBuffer) {
  const layers: MapLayer[] = new Array(totalLayers),
    totalTiles = w * h,
    halfPoint = buffer.byteLength / 2;

  for(let i = 0; i < totalLayers; i++) {
    layers[i] = {
      data: new Uint16Array(buffer, i * MAP_BYTE_SIZE * totalTiles, totalTiles),
      visibleData:  new Uint16Array(buffer, halfPoint + (i * MAP_BYTE_SIZE * totalTiles), totalTiles)
    }
  }

  return layers;
}

export function createMap(title: string, w: number, h: number) {
  const buffer = new ArrayBuffer(w * h * LAYERS * MAP_BYTE_SIZE * 2),
    layer = createLayers(w, h, LAYERS, buffer);

  const map: TileMap = {
    title,
    w,
    h,
    buffer,
    layer,
    lastUpdated: new Date()
  };

  return map;
}
