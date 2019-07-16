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
      entries: []
    })
  },

  setTile(state, change: TileChangeEntry) {
    if (state.changes.length < 1)
      return;
    
    const offset: number = state.map.w * change.y + change.x,
      changes = state.changes[state.changes.length-1],
      layer = state.map.layer[change.l]

    change.p = layer.data[offset];
    change.pv = layer.visibleData[offset];
    layer.data[offset] = change.v;
    layer.visibleData[offset] = change.v;

    changes.entries.push(change);

    state.map.lastUpdated = new Date();
  },

  undo(state) {
    if (state.changes.length < 1)
      return;

    const lastChanges = state.changes.pop();

    for (let i = lastChanges!.entries.length-1; i >= 0; i--) {
      const change = lastChanges!.entries[i];
      const offset: number = state.map.w * change.y + change.x;
      const layer = state.map.layer[change.l];
      layer.data[offset] = change.p;
      layer.visibleData[offset] = change.pv;
    }

    state.map.lastUpdated = new Date();
  }

};
