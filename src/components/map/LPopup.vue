<template>
  <div style="display: none">
    <div ref="popupEl">
      <slot>{{ content }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, watch, type PropType } from 'vue';
import type L from 'leaflet';
import { MARKER_CONTEXT_KEY } from './keys';

const props = defineProps({
  content: {
    type: String,
    default: undefined
  },
  options: {
    type: Object as PropType<L.PopupOptions>,
    default: () => ({})
  }
});

const markerContext = inject(MARKER_CONTEXT_KEY, null);
const popupEl = ref<HTMLDivElement | null>(null);

const attachPopup = () => {
  const marker = markerContext?.marker.value;
  if (!marker) return;

  if (popupEl.value) {
    marker.bindPopup(popupEl.value, props.options);
  } else if (props.content) {
    marker.bindPopup(props.content, props.options);
  }
};

onMounted(() => {
  attachPopup();
});

watch(
  () => markerContext?.marker.value,
  () => {
    attachPopup();
  }
);

watch(
  () => props.content,
  (newContent) => {
    const marker = markerContext?.marker.value;
    if (marker && newContent !== undefined && !popupEl.value) {
      marker.setPopupContent(newContent);
    }
  }
);

onUnmounted(() => {
  const marker = markerContext?.marker.value;
  marker?.unbindPopup();
});
</script>
