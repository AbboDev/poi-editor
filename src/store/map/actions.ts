import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { MapStateInterface, Point } from './state';

const actions: ActionTree<MapStateInterface, StateInterface> = {
  updateCenter({ commit }, center: [number, number]) {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      !isNaN(center[0]) &&
      !isNaN(center[1])
    ) {
      commit('updateCenter', center);
    }
  },

  updateCenterById({ commit, getters }, id: string) {
    const point = (getters.getPoint as (id: string) => Point | undefined)(id);
    if (point) {
      commit('updateCenter', point.center);
    }
  },

  push(
    { commit, state },
    point: Partial<Point> & { id: string; title: string }
  ) {
    if (typeof point.center === 'undefined') {
      point.center = state.center;
    }
    commit('push', point as Point);
  },

  pushMultiple(
    { commit, state },
    points: (Partial<Point> & { id: string; title: string })[]
  ) {
    for (const point of points) {
      if (typeof point.center === 'undefined') {
        point.center = state.center;
      }
    }
    commit('pushMultiple', points as Point[]);
  },

  update(
    { commit, getters },
    { id, data }: { id: string; data: Partial<Point> }
  ) {
    const point = (getters.getPoint as (id: string) => Point | undefined)(id);
    if (point) {
      commit('update', { point, data });
    }
  },

  remove({ commit, getters }, id: string) {
    const point = (getters.getPoint as (id: string) => Point | undefined)(id);
    if (point) {
      commit('remove', point);
    }
  }
};

export default actions;
