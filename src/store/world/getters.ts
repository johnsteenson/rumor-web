import { GetterTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';

import { Tileset, TilesetView } from '@/types/tileset';
import { Nullable, TileSize } from '@/types/primitives';
import { MapView, ToolType } from '@/types/map';

export const getters: GetterTree<WorldState, RootState> = {
  getTileset(state: WorldState): Tileset {
    return state.tileset;
  },

  getTilesetView(state: WorldState): Nullable<TilesetView> {
    if (!state.tileset) {
      return null;
    }

    const { w, h } = state.tileset.tileSize,
      scale = state.componentScale,
      tilesetView: TilesetView = {
        tileset: state.tileset,
        tileSize: {
          w,
          h,
          scale,
          scaledW: w * scale,
          scaledH: h * scale,
        },
        tool: state.tool,
        tileSelection: state.tileSelection,
        curSection: state.curSection,
      };

    return tilesetView;
  },

  getMapView(state: WorldState): Nullable<MapView> {
    if (!state.map) {
      return null;
    }

    const { w, h } = state.tileset.tileSize,
      scale = state.mapScale,
      mapView: MapView = {
        map: state.map,
        tileset: state.tileset,
        tileSize: {
          w,
          h,
          scale,
          scaledW: w * scale,
          scaledH: h * scale
        },
        tool: state.tool,
        tileSelection: state.tileSelection,
        curSection: state.curSection,
      };



    return mapView;
  },

};
