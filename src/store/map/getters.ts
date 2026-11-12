import { GetterTree } from 'vuex';
import { StateInterface } from '../index';
import { MapStateInterface, Point } from './state';

const getters: GetterTree<MapStateInterface, StateInterface> = {
  getPoint(state: MapStateInterface) {
    return (id: string): Point | undefined => {
      return state.points.find((item) => item.id === id);
    };
  }
};

export default getters;
