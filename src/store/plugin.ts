import { getServiceInterface } from '@/service/rumor';
import { Store } from 'vuex';

/* This is a hack to get the store.  Importing the store directly does not allow
mutations to be committed to submodules.  Thus, we are using this plugin as a workaround.
*/


export function createPlugin() {
  return (store: Store<any>) => {
    getServiceInterface().registerStoreEvents(store);
  }
}