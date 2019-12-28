import { GetterTree } from 'vuex';
import { ProjectState } from './types';
import { RootState } from '../types';
import { TileSize } from '@/types/geometry';

export const getters: GetterTree<ProjectState, RootState> = {
  /*
    getTileSize(state: ProjectState): TileSize {
      const {w, h} = state.tileSize,
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
    */
};
