<template>
  <div
    ref="container"
    class="leaflet-map-container col full-height"
    style="min-height: 100%; width: 100%"
  >
    <slot v-if="isReady" />
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  provide,
  onMounted,
  onUnmounted,
  watch,
  type PropType
} from 'vue';
import L from 'leaflet';
import { setupLeafletIcons } from './leaflet-icons';
import { MAP_CONTEXT_KEY } from './keys';
import type { Coordinates } from './types';

const props = defineProps({
  center: {
    type: Array as unknown as PropType<Coordinates>,
    default: () => [45.6982642, 9.6772698]
  },
  zoom: {
    type: Number,
    default: 15
  },
  minZoom: {
    type: Number,
    default: undefined
  },
  maxZoom: {
    type: Number,
    default: undefined
  },
  options: {
    type: Object as PropType<L.MapOptions>,
    default: () => ({})
  }
});

const emit = defineEmits<{
  (e: 'ready', map: L.Map): void;
  (e: 'click', event: L.LeafletMouseEvent): void;
  (e: 'moveend', event: L.LeafletEvent): void;
  (e: 'zoomend', event: L.LeafletEvent): void;
  (e: 'update:center', center: Coordinates): void;
  (e: 'update:zoom', zoom: number): void;
}>();

const container = ref<HTMLDivElement | null>(null);
const map = shallowRef<L.Map | null>(null);
const isReady = ref(false);

let resizeObserver: ResizeObserver | null = null;

provide(MAP_CONTEXT_KEY, {
  map,
  isReady
});

onMounted(() => {
  if (!container.value) return;

  setupLeafletIcons();

  const mapInstance = L.map(container.value, {
    ...props.options,
    center: props.center,
    zoom: props.zoom,
    minZoom: props.minZoom,
    maxZoom: props.maxZoom
  });

  mapInstance.on('click', (event: L.LeafletMouseEvent) => {
    emit('click', event);
  });

  mapInstance.on('moveend', (event: L.LeafletEvent) => {
    emit('moveend', event);
    const center = mapInstance.getCenter();
    emit('update:center', [
      parseFloat(center.lat.toFixed(8)),
      parseFloat(center.lng.toFixed(8))
    ]);
  });

  mapInstance.on('zoomend', (event: L.LeafletEvent) => {
    emit('zoomend', event);
    emit('update:zoom', mapInstance.getZoom());
  });

  map.value = mapInstance;
  isReady.value = true;

  if (
    typeof window !== 'undefined' &&
    'ResizeObserver' in window &&
    container.value
  ) {
    resizeObserver = new ResizeObserver(() => {
      mapInstance.invalidateSize();
    });
    resizeObserver.observe(container.value);
  }

  emit('ready', mapInstance);
});

watch(
  () => props.center,
  (newCenter) => {
    if (!map.value || !newCenter) return;
    const current = map.value.getCenter();
    if (
      Math.abs(current.lat - newCenter[0]) > 1e-6 ||
      Math.abs(current.lng - newCenter[1]) > 1e-6
    ) {
      map.value.setView(newCenter, map.value.getZoom());
    }
  },
  { deep: true }
);

watch(
  () => props.zoom,
  (newZoom) => {
    if (!map.value || typeof newZoom !== 'number') return;
    if (map.value.getZoom() !== newZoom) {
      map.value.setZoom(newZoom);
    }
  }
);

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (map.value) {
    map.value.remove();
    map.value = null;
  }

  isReady.value = false;
});

defineExpose({
  map,
  isReady
});
</script>
