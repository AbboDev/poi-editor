import { MutationTree } from 'vuex';
import { MapStateInterface, Point } from './state';

const mutation: MutationTree<MapStateInterface> = {
  updateCenter(state: MapStateInterface, center: [number, number]) {
    state.center = center;
  },
  push(state: MapStateInterface, point: Point) {
    state.points.push(point);
  },
  pushMultiple(state: MapStateInterface, points: Point[]) {
    state.points = state.points.concat(points);
  },
  update(
    state: MapStateInterface,
    { point, data }: { point: Point; data: Partial<Point> }
  ) {
    const index = state.points.indexOf(point);
    if (index !== -1 && state.points[index]) {
      state.points[index] = {
        ...state.points[index],
        ...data
      };
    }
  },
  remove(state: MapStateInterface, point: Point) {
    const index = state.points.indexOf(point);
    if (index !== -1) {
      state.points.splice(index, 1);
    }
  }
};

export default mutation;
