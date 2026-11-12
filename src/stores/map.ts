import { defineStore } from 'pinia';

export interface Point {
  id: string;
  title: string;
  center?: [number, number];
}

export const DEFAULT_CENTER: [number, number] = [45.6982642, 9.6772698];

export interface MapState {
  center: [number, number];
  points: Point[];
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    center: [45.6982642, 9.6772698],
    points: []
  }),

  actions: {
    updateCenter(center: [number, number]) {
      this.center = center;
    },
    updateCenterById(id: string) {
      const point = this.points.find((p) => p.id === id);
      if (point?.center) {
        this.center = point.center;
      }
    },
    push(point: Partial<Point> & { id: string; title: string }) {
      if (typeof point.center === 'undefined') {
        point.center = [...DEFAULT_CENTER];
      }
      this.points.push(point as Point);
    },
    pushMultiple(points: (Partial<Point> & { id: string; title: string })[]) {
      for (const point of points) {
        if (typeof point.center === 'undefined') {
          point.center = [...DEFAULT_CENTER];
        }
      }
      this.points.push(...(points as Point[]));
    },
    update(id: string, data: Partial<Point>) {
      const point = this.points.find((p) => p.id === id);
      if (point) {
        Object.assign(point, data);
      }
    },
    remove(id: string) {
      const index = this.points.findIndex((p) => p.id === id);
      if (index !== -1) {
        this.points.splice(index, 1);
      }
    }
  }
});
