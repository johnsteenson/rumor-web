import { GetterTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';

import { Tileset } from '@/types/tileset';
import { TileSize } from '@/types/primitives';

export const getters: GetterTree<WorldState, RootState> = {
  getTileset(state: WorldState): Tileset {
    return state.tileset;
  },

  getTileSize(state: WorldState): TileSize {
    if (!state.tileset) {
      return {
        w: 0,
        h: 0,
        scale: 0,
        scaledW: 0,
        scaledH: 0,
      };
    }

    const {w, h} = state.tileset.tileSize,
      scale: number = state.mapScale,
      tileSize: TileSize = {
        w,
        h,
        scale,
        scaledW: w * scale,
        scaledH: h * scale,
    };

    return tileSize;
  },
};
