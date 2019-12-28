import { ActionTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';

import { mapStore } from "@/world";

export const actions: ActionTree<WorldState, RootState> = {
  setTool({ commit }, toolId: number) {
    commit('setTool', toolId);
  },

  undo() {
    mapStore.mapMutator.undo();
  },

  setLayer({ commit }, layerId: number) {
    commit('setLayer', layerId);
  }

};
