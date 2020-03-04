import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import { projectModule } from './project/index';
import { worldModule } from './world/index';
import { RootState } from './types';

import { createPlugin } from './plugin';

Vue.use(Vuex);

const state: RootState = {
  version: '1.0.0',
};

const storeOptions: StoreOptions<RootState> = {
  state,
  modules: {
    project: projectModule,
    world: worldModule,
  },
  plugins: [
    createPlugin()
  ]
};

export default new Vuex.Store<RootState>(storeOptions);
