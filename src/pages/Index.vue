<template>
  <q-page class="flex items-stretch">
    <div
      ref="mapContainer"
      class="col full-height"
      style="min-height: 100%; width: 100%"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { uid } from 'quasar';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { useMapStore, Point } from 'src/stores/map';

// Fix Leaflet default marker icons for bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl
});

const { t } = useI18n();
const mapStore = useMapStore();
const mapContainer = ref<HTMLDivElement | null>(null);

let map: L.Map | null = null;
let resizeObserver: ResizeObserver | null = null;
const markersMap = new Map<string, L.Marker>();

const syncMarkers = (points: Point[]) => {
  if (!map) return;

  const currentIds = new Set<string>();

  for (const point of points) {
    if (!point.center) continue;
    currentIds.add(point.id);

    const existingMarker = markersMap.get(point.id);
    if (existingMarker) {
      const pos = existingMarker.getLatLng();
      if (
        Math.abs(pos.lat - point.center[0]) > 1e-6 ||
        Math.abs(pos.lng - point.center[1]) > 1e-6
      ) {
        existingMarker.setLatLng(point.center);
      }
      const popup = existingMarker.getPopup();
      if (popup && popup.getContent() !== point.title) {
        existingMarker.setPopupContent(point.title);
      }
    } else {
      const marker = L.marker(point.center, { draggable: true });
      marker.bindPopup(point.title);

      marker.on('dragend', () => {
        const latlng = marker.getLatLng();
        mapStore.update(point.id, {
          center: [
            parseFloat(latlng.lat.toFixed(8)),
            parseFloat(latlng.lng.toFixed(8))
          ]
        });
      });

      marker.addTo(map);
      markersMap.set(point.id, marker);
    }
  }

  for (const [id, marker] of markersMap.entries()) {
    if (!currentIds.has(id)) {
      marker.remove();
      markersMap.delete(id);
    }
  }
};

onMounted(() => {
  if (!mapContainer.value) return;

  map = L.map(mapContainer.value).setView(mapStore.center, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  }).addTo(map);

  map.on('click', (event: L.LeafletMouseEvent) => {
    const id = uid();
    const position: [number, number] = [
      parseFloat(event.latlng.lat.toFixed(8)),
      parseFloat(event.latlng.lng.toFixed(8))
    ];

    mapStore.push({
      id,
      title: t('points.newPoint'),
      center: position
    });
  });

  map.on('moveend', () => {
    if (!map) return;
    const centerCoord = map.getCenter();
    const newCenter: [number, number] = [
      parseFloat(centerCoord.lat.toFixed(8)),
      parseFloat(centerCoord.lng.toFixed(8))
    ];

    if (
      Math.abs(mapStore.center[0] - newCenter[0]) > 1e-6 ||
      Math.abs(mapStore.center[1] - newCenter[1]) > 1e-6
    ) {
      mapStore.updateCenter(newCenter);
    }
  });

  syncMarkers(mapStore.points);

  if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(() => {
      map?.invalidateSize();
    });
    resizeObserver.observe(mapContainer.value);
  }
});

watch(
  () => mapStore.center,
  (newCenter) => {
    if (!map) return;
    const cur = map.getCenter();
    if (
      Math.abs(cur.lat - newCenter[0]) > 1e-6 ||
      Math.abs(cur.lng - newCenter[1]) > 1e-6
    ) {
      map.setView(newCenter);
    }
  },
  { deep: true }
);

watch(
  () => mapStore.points,
  (points) => {
    syncMarkers(points);
  },
  { deep: true }
);

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  for (const marker of markersMap.values()) {
    marker.remove();
  }
  markersMap.clear();

  if (map) {
    map.remove();
    map = null;
  }
});
</script>
