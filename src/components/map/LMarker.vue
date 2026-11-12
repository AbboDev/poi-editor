<template>
  <div style="display: none">
    <slot v-if="marker" />
  </div>
</template>

<script setup lang="ts">
import {
  shallowRef,
  inject,
  provide,
  onMounted,
  onUnmounted,
  watch,
  type PropType
} from 'vue';
import L from 'leaflet';
import { MAP_CONTEXT_KEY, MARKER_CONTEXT_KEY } from './keys';
import type { Coordinates } from './types';

const props = defineProps({
  coordinates: {
    type: Array as unknown as PropType<Coordinates>,
    default: undefined
  },
  draggable: {
    type: Boolean,
    default: false
  },
  icon: {
    type: Object as PropType<L.Icon | L.DivIcon>,
    default: undefined
  },
  options: {
    type: Object as PropType<L.MarkerOptions>,
    default: () => ({})
  }
});

const emit = defineEmits<{
  (e: 'click', event: L.LeafletMouseEvent): void;
  (e: 'dragstart', event: L.LeafletEvent): void;
  (e: 'drag', event: L.LeafletEvent): void;
  (e: 'dragend', event: L.DragEndEvent): void;
  (e: 'update:coordinates', coordinates: Coordinates): void;
}>();

const mapContext = inject(MAP_CONTEXT_KEY, null);
const marker = shallowRef<L.Marker | null>(null);

provide(MARKER_CONTEXT_KEY, {
  marker
});

const createMarker = (mapInstance: L.Map) => {
  if (marker.value || !props.coordinates) return;

  const markerInstance = L.marker(props.coordinates, {
    ...props.options,
    draggable: props.draggable,
    icon: props.icon
  });

  markerInstance.on('click', (event: L.LeafletMouseEvent) => {
    emit('click', event);
  });

  markerInstance.on('dragstart', (event: L.LeafletEvent) => {
    emit('dragstart', event);
  });

  markerInstance.on('drag', (event: L.LeafletEvent) => {
    emit('drag', event);
  });

  markerInstance.on('dragend', (event: L.DragEndEvent) => {
    emit('dragend', event);
    const latlng = markerInstance.getLatLng();
    emit('update:coordinates', [
      parseFloat(latlng.lat.toFixed(8)),
      parseFloat(latlng.lng.toFixed(8))
    ]);
  });

  markerInstance.addTo(mapInstance);
  marker.value = markerInstance;
};

onMounted(() => {
  if (mapContext?.map.value) {
    createMarker(mapContext.map.value);
  }
});

watch(
  () => mapContext?.map.value,
  (newMap) => {
    if (newMap && !marker.value) {
      createMarker(newMap);
    }
  }
);

watch(
  () => props.coordinates,
  (newCoords) => {
    if (!newCoords) return;

    if (!marker.value && mapContext?.map.value) {
      createMarker(mapContext.map.value);
      return;
    }

    if (marker.value) {
      const current = marker.value.getLatLng();
      if (
        Math.abs(current.lat - newCoords[0]) > 1e-6 ||
        Math.abs(current.lng - newCoords[1]) > 1e-6
      ) {
        marker.value.setLatLng(newCoords);
      }
    }
  },
  { deep: true }
);

watch(
  () => props.draggable,
  (draggable) => {
    if (!marker.value) return;
    if (draggable) {
      marker.value.dragging?.enable();
    } else {
      marker.value.dragging?.disable();
    }
  }
);

watch(
  () => props.icon,
  (newIcon) => {
    if (marker.value && newIcon) {
      marker.value.setIcon(newIcon);
    }
  }
);

onUnmounted(() => {
  if (marker.value) {
    marker.value.remove();
    marker.value = null;
  }
});

defineExpose({
  marker
});
</script>
