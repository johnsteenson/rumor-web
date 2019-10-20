import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { WorldState } from './types';
import { RootState } from '../types';
import { TileMap, MapLayer, ToolType, TileChange } from '@/types/map';
import tileset from '@/data/tileset-world.json';
import { createMap } from '@/lib/world/tilemap';
// import { mapTileset } from '@/lib/tilesetUtils';
import { Tileset } from '@/types/tileset';

const namespaced: boolean = true,
  map: TileMap = createMap('My Kewl Map', 20, 15),
  sourceTileset: Tileset = tileset as Tileset,
  state: WorldState = {
    map,
    tool: ToolType.PENCIL,
    tileSelection: {
      tileIndices: [0],
      w: 1,
      h: 1,
    },
    curSection: 0,
    tileset: sourceTileset,
    mapScale: 2,
    componentScale: 2,
    changes: [],
  };

export const worldModule: Module<WorldState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
