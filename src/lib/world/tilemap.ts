import { MapLayer, TileMap } from '@/types/map';
import { Tileset } from '@/types/tileset';

const MAP_BYTE_SIZE = 2,
  LAYERS = 2,
  BASE_WATER_TILE = 4;

export function createLayers(w: number, h: number, totalLayers: number, buffer: ArrayBuffer, fillBlank: boolean = false): MapLayer[] {
  const layers: MapLayer[] = new Array(totalLayers),
    totalTiles = w * h,
    halfPoint = buffer.byteLength / 2;

  for (let l = 0; l < totalLayers; l++) {
    layers[l] = {
      id: l,
      templateData: new Uint16Array(buffer, l * MAP_BYTE_SIZE * totalTiles, totalTiles),
      visibleData: new Uint16Array(buffer, halfPoint + (l * MAP_BYTE_SIZE * totalTiles), totalTiles)
    };

    if (fillBlank) {
      for (let j = 0; j < h; j++) {
        for (let k = 0; k < w; k++) {
          layers[l].templateData[j * w + k] = 0;
          layers[l].visibleData[j * w + k] = l === 0 ? BASE_WATER_TILE : 0;
        }
      }
    }
  }

  return layers;
}

export function createMap(title: string, w: number, h: number, tileset: Tileset) {
  const buffer = new ArrayBuffer(w * h * LAYERS * MAP_BYTE_SIZE * 2),
    layer = createLayers(w, h, LAYERS, buffer, true);

  const map: TileMap = {
    title,
    w,
    h,
    buffer,
    tileset,
    layer,
    lastUpdated: new Date()
  };

  return map;
}

export function getTemplateTile(value: number, tileset: Tileset) {
  const section = (value & 0xF000) >> 12,
    val = (value & 0x0FFF);

  return tileset.sections[section].templateTiles[val];
}

export function unpackMapBuf(val: number): [number, number] {
  return [(val & 0xF000) >> 12, (val & 0x0FFF)];
}

export function packMapBuf(sectionNum: number, tileValue: number) {
  return (sectionNum << 12) | (tileValue & 0x0FFF);
}
