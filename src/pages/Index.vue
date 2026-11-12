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
        v-for="(item, index) in $store.state.map.points"
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
import type { Point } from 'src/store/map';

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
  data() {
    return {
      zoom: 15,
      isMoved: false,
      center: this.$store.state.map.center as [number, number]
    };
  },
  watch: {
    '$store.state.map.center'() {
      const newCenter = this.$store.state.map.center;
      const isEqual =
        newCenter.length === this.center.length &&
        newCenter[0] === this.center[0] &&
        newCenter[1] === this.center[1];

      if (!isEqual) {
        this.center = this.$store.state.map.center;
      }
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

        this.$store.dispatch('map/push', {
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

      this.$store.dispatch('map/update', {
        id: marker.id,
        data: {
          center: position
        }
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

      this.$store.dispatch('map/updateCenter', center);
    }
  }
});
</script>
