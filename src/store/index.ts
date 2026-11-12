import { store } from 'quasar/wrappers';
import { InjectionKey } from 'vue';
import {
  createStore,
  Store as VuexStore,
  useStore as baseUseStore
} from 'vuex';

import map, { MapStateInterface } from './map';

export interface StateInterface {
  map: MapStateInterface;
}

// provide typing for `this.$store`
declare module 'vue' {
  interface ComponentCustomProperties {
    $store: VuexStore<StateInterface>;
  }
}

// provide typing for `useStore` helper
export const storeKey: InjectionKey<VuexStore<StateInterface>> =
  Symbol('vuex-key');

export default store((/* { ssrContext } */) => {
  const Store = createStore<StateInterface>({
    modules: {
      map
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: !!process.env.DEBUGGING
  });

  return Store;
});

export function useStore() {
  return baseUseStore(storeKey);
}
