<template>
  <q-page class="flex items-stretch">
    <l-map
      :center="center"
      :zoom="15"
      @click="addMarker"
      @moveend="changeCenter"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        :attribution="osmAttribution"
      />

      <l-marker
        v-for="item in points"
        :key="item.id"
        :coordinates="item.center"
        draggable
        @dragend="onMarkerDrag(item.id, $event)"
      >
        <l-popup>
          {{ item.title }}
        </l-popup>
      </l-marker>
    </l-map>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { uid } from 'quasar';
import { storeToRefs } from 'pinia';
import type L from 'leaflet';
import { LMap, LTileLayer, LMarker, LPopup } from 'components/map';
import { useMapStore } from 'src/stores/map';
import type { Coordinates } from 'components/map';

const { t } = useI18n();
const mapStore = useMapStore();
const { points, center } = storeToRefs(mapStore);

const osmAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

const addMarker = (event: L.LeafletMouseEvent) => {
  const id = uid();
  const position: Coordinates = [
    parseFloat(event.latlng.lat.toFixed(8)),
    parseFloat(event.latlng.lng.toFixed(8))
  ];

  mapStore.push({
    id,
    title: t('points.newPoint'),
    center: position
  });
};

const onMarkerDrag = (id: string, event: L.DragEndEvent) => {
  const latlng = (event.target as L.Marker).getLatLng();
  const position: Coordinates = [
    parseFloat(latlng.lat.toFixed(8)),
    parseFloat(latlng.lng.toFixed(8))
  ];

  mapStore.update(id, {
    center: position
  });
};

const changeCenter = (event: L.LeafletEvent) => {
  const map = event.target as L.Map;
  const centerCoord = map.getCenter();
  const newCenter: Coordinates = [
    parseFloat(centerCoord.lat.toFixed(8)),
    parseFloat(centerCoord.lng.toFixed(8))
  ];

  if (
    Math.abs(mapStore.center[0] - newCenter[0]) > 1e-6 ||
    Math.abs(mapStore.center[1] - newCenter[1]) > 1e-6
  ) {
    mapStore.updateCenter(newCenter);
  }
};
</script>
