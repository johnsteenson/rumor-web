import Vue from 'vue';
import { MutationTree } from 'vuex';
import { WorldState } from './types';
import { TileChange, TileChangeEntry, TileSelection } from '@/types/map';

export const mutations: MutationTree<WorldState> = {

  selectTileIndices(state, selection: TileSelection) {
    state.tileSelection = selection;
  },

  newTileChange(state) {
    state.changes.push({
      entries: [],
    });
  },

  setTool(state, toolId: number) {
    state.tool = toolId;
  },

  setLayer(state, layerId: number) {
    state.curLayer = layerId;
    /* Currently, layer and section are tied together, but may change as we support
    // different tileset formats */
    state.curSection = layerId;
  }

};
