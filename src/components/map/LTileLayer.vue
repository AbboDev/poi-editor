<template>
  <div style="display: none" />
</template>

<script setup lang="ts">
import { inject, onMounted, onUnmounted, watch, type PropType } from 'vue';
import L from 'leaflet';
import { MAP_CONTEXT_KEY } from './keys';

const props = defineProps({
  url: {
    type: String,
    required: true
  },
  attribution: {
    type: String,
    default: undefined
  },
  maxZoom: {
    type: Number,
    default: 19
  },
  minZoom: {
    type: Number,
    default: undefined
  },
  options: {
    type: Object as PropType<L.TileLayerOptions>,
    default: () => ({})
  }
});

const mapContext = inject(MAP_CONTEXT_KEY, null);
let tileLayer: L.TileLayer | null = null;

const createTileLayer = (mapInstance: L.Map) => {
  if (tileLayer) {
    tileLayer.remove();
  }

  tileLayer = L.tileLayer(props.url, {
    ...props.options,
    attribution: props.attribution,
    maxZoom: props.maxZoom,
    minZoom: props.minZoom
  }).addTo(mapInstance);
};

onMounted(() => {
  if (mapContext?.map.value) {
    createTileLayer(mapContext.map.value);
  }
});

watch(
  () => mapContext?.map.value,
  (newMap) => {
    if (newMap && !tileLayer) {
      createTileLayer(newMap);
    }
  }
);

watch(
  () => props.url,
  (newUrl) => {
    if (tileLayer && newUrl) {
      tileLayer.setUrl(newUrl);
    }
  }
);

onUnmounted(() => {
  if (tileLayer) {
    tileLayer.remove();
    tileLayer = null;
  }
});
</script>
