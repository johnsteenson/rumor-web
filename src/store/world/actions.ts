import { ActionTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';
import { TileChangeEntry, TileDrawData, MapLayer, TileDraw } from '@/types/map';
import { TileType, TemplateTileType } from '@/types/tileset';

import { getRectangularTileIndex, visitSurroundingTiles, getWaterTileIndex, calculateTileValue } from '@/lib/world/autotile';
import { Point } from '@/types/primitives';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { getFirstTile } from '@/lib/world/tileset';

export const actions: ActionTree<WorldState, RootState> = {
  setTool({ commit }, toolId: number) {
    commit('setTool', toolId);
  },

  setLayer({ commit }, layerId: number) {
    commit('setLayer', layerId);
  }

};
