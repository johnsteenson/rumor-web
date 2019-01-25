import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { WorldState } from './types';
import { RootState } from '../types';
import { Map, MapLayer, Tool, ToolType } from '@/types/map';
import tileset from '@/data/tileset.json';

const LAYERS = 3;
const MAP_BYTE_SIZE = 2;

/* TODO export to another class */

function createLayers(w: number, h: number, buffer: ArrayBuffer) {
  const layers: MapLayer[] = new Array(LAYERS),
    totalTiles = w * h;

  for(let i = 0; i < LAYERS; i++) {
    layers[i] = {
      tiles: new Uint16Array(buffer, i * MAP_BYTE_SIZE * totalTiles, totalTiles)
    }
  }

  return layers;
}

function createMap(title: string, w: number, h: number) {
  const buffer = new ArrayBuffer(w * h * LAYERS * MAP_BYTE_SIZE),
    layer = createLayers(w, h, buffer);

  const map: Map = {
    title,
    w,
    h,
    buffer,
    layer,
  };

  return map;
}


const namespaced: boolean = true,
  map: Map = createMap('My Kewl Map', 50, 50),
  state: WorldState = {
    map,
    tool: {
      type: ToolType.PENCIL,
      selectedTiles: [0]
    },
    tileset,
    mapScale: 2,
    componentScale: 2,
  };

export const worldModule: Module<WorldState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations,
};
