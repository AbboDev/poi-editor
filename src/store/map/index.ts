import { Module } from 'vuex';
import { StateInterface } from '../index';
import state, { MapStateInterface } from './state';
import actions from './actions';
import getters from './getters';
import mutations from './mutations';

export type { MapStateInterface, Point } from './state';

const mapModule: Module<MapStateInterface, StateInterface> = {
  namespaced: true,
  actions,
  getters,
  mutations,
  state
};

export default mapModule;
