<template>
  <q-page class="flex items-stretch">
    <l-map
      ref="map"
      :tap="false"
      :zoom="zoom"
      :center="center"
      style="height: auto"
      @click="addMarker"
      @moveend="changeCenter"
    >
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        :name="$t('map.openStreetMap')"
      />

      <l-marker
        v-for="(item, index) in mapStore.points"
        :key="`marker-${index}`"
        :lat-lng="item.center"
        draggable
        @add="add($event, item)"
        @dragend="drag"
      >
        <l-popup>
          {{ item.title }}
        </l-popup>
      </l-marker>
    </l-map>
  </q-page>
</template>

<script lang="ts">
import { uid } from 'quasar';
import { defineComponent } from 'vue';
import { LMap, LPopup, LMarker, LTileLayer } from '@vue-leaflet/vue-leaflet';
import { useMapStore, Point } from 'src/stores/map';

interface MapClickEvent {
  latlng?: {
    lat: number;
    lng: number;
  };
}

export default defineComponent({
  components: {
    LMap,
    LPopup,
    LMarker,
    LTileLayer
  },
  name: 'PageIndex',
  setup() {
    const mapStore = useMapStore();
    return { mapStore };
  },
  data() {
    return {
      zoom: 15,
      isMoved: false,
      center: useMapStore().center
    };
  },
  watch: {
    'mapStore.center': {
      handler(newCenter: [number, number]) {
        const isEqual =
          newCenter.length === this.center.length &&
          newCenter[0] === this.center[0] &&
          newCenter[1] === this.center[1];

        if (!isEqual) {
          this.center = newCenter;
        }
      },
      deep: true
    }
  },
  methods: {
    addMarker(event: MapClickEvent) {
      if (event.latlng) {
        const id = uid();
        const position: [number, number] = [
          parseFloat(event.latlng.lat.toFixed(8)),
          parseFloat(event.latlng.lng.toFixed(8))
        ];

        this.mapStore.push({
          id,
          title: this.$t('points.newPoint'),
          center: position
        });
      }
    },
    add(event: { target: { id?: string } }, item: Point) {
      event.target.id = item.id;
    },
    drag(event: {
      target: { id: string; getLatLng: () => { lat: number; lng: number } };
    }) {
      const marker = event.target;
      const latlng = marker.getLatLng();
      const position: [number, number] = [
        parseFloat(latlng.lat.toFixed(8)),
        parseFloat(latlng.lng.toFixed(8))
      ];

      this.mapStore.update(marker.id, {
        center: position
      });
    },
    changeCenter(event: {
      target: { getCenter: () => { lat: number; lng: number } };
    }) {
      const centerCoord = event.target.getCenter();
      const center: [number, number] = [
        parseFloat(centerCoord.lat.toFixed(8)),
        parseFloat(centerCoord.lng.toFixed(8))
      ];

      this.center = center;
      this.mapStore.updateCenter(center);
    }
  }
});
</script>
