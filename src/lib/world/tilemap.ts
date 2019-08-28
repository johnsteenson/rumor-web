import { MapLayer, TileMap } from "@/types/map";

const MAP_BYTE_SIZE = 2,
  LAYERS = 2;

function createLayers(w: number, h: number, totalLayers: number, buffer: ArrayBuffer) {
  const layers: MapLayer[] = new Array(totalLayers),
    totalTiles = w * h,
    halfPoint = buffer.byteLength / 2;

  for(let i = 0; i < totalLayers; i++) {
    layers[i] = {
      templateData: new Uint16Array(buffer, i * MAP_BYTE_SIZE * totalTiles, totalTiles),
      visibleData:  new Uint16Array(buffer, halfPoint + (i * MAP_BYTE_SIZE * totalTiles), totalTiles)
    }

    for (let j = 0; j < h; j++) {
      for (let k = 0; k < w; k++) {
        layers[i].templateData[j * w + k] = 0;
        layers[i].visibleData[j * w + k] = 1;
      }
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

export function unpackMapBuf(val: number): [number, number] {
  return [(val & 0xF000) >> 12, (val & 0x0FFF)];
}

export function packMapBuf(sectionNum: number, tileValue: number) {
  return (sectionNum << 12) | (tileValue & 0x0FFF);
}
