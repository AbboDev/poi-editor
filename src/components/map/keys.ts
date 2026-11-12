import type { InjectionKey } from 'vue';
import type { MapContext, MarkerContext } from './types';

export const MAP_CONTEXT_KEY: InjectionKey<MapContext> =
  Symbol('LeafletMapContext');

export const MARKER_CONTEXT_KEY: InjectionKey<MarkerContext> = Symbol(
  'LeafletMarkerContext'
);
