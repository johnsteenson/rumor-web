import { MutationTree } from 'vuex';
import { ProjectState } from './types';

export const mutations: MutationTree<ProjectState> = {
  setOffline(state, offline: boolean) {
    state.offline = offline;
  },

  setLoggedIn(state, loggedIn: boolean) {
    state.loggedIn = loggedIn;
  }
};
