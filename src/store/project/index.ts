import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions';
import { mutations } from './mutations';
import { ProjectState } from './types';
import { RootState } from '../types';

const namespaced: boolean = true;

const state: ProjectState = {
  title: 'My Kewl Project',
  defaultTileSize: {
    w: 16,
    h: 16,
  },
  loggedIn: false,
  offline: false,
  signedInUser: ""
};

export const projectModule: Module<ProjectState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations,
};
