import type { ShallowRef, Ref } from 'vue';
import type L from 'leaflet';

export type Coordinates = [number, number];

export interface MapContext {
  map: ShallowRef<L.Map | null>;
  isReady: Ref<boolean>;
}

export interface MarkerContext {
  marker: ShallowRef<L.Marker | null>;
}
