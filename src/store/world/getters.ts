import { GetterTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';

import { Tileset, TilesetView } from '@/types/tileset';
import { TileSize } from '@/types/geometry';
import { Nullable } from '@/types/primitives'
import { MapView, ToolType } from '@/types/map';

import { mapStore } from '@/world';

export const getters: GetterTree<WorldState, RootState> = {
  getTilesetView(state: WorldState): Nullable<TilesetView> {
    const { w, h } = mapStore.map.tileset.tileSize,
      scale = state.componentScale,
      tilesetView: TilesetView = {
        tileSize: {
          w,
          h,
          scale,
          scaledW: w * scale,
          scaledH: h * scale,
        },
        tool: state.tool,
        tileset: mapStore.map.tileset,
        tileSelection: state.tileSelection,
        curSection: state.curSection,
        curLayer: state.curLayer
      };

    return tilesetView;
  },

  /*
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
  */

};
