<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> POI Editor </q-toolbar-title>

        <q-btn
          icon="add_location_alt"
          @click="addPoint"
          round
          flat
          color="white"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="column no-wrap" style="height: 100%">
        <q-item-label header> Points </q-item-label>

        <q-item clickable v-ripple @click="addPoint">
          <q-item-section avatar>
            <q-icon name="add_location_alt" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Add point</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-file
              clearable
              borderless
              v-model="file"
              label="Import points"
              class="_sidebar-input-file"
            >
              <template #before>
                <q-icon name="share_location" />
              </template>
              <template #after>
                <q-btn
                  round
                  color="primary"
                  icon="send"
                  @click="importPoints"
                />
              </template>
            </q-file>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-scroll-area style="height: 100%">
          <EssentialLink
            v-for="(item, index) in $store.state.map.points"
            :key="`marker-${index}`"
            v-bind="item"
            :coordinates="item.center"
          />
        </q-scroll-area>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { uid } from 'quasar';
import { defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import { importOV2, OV2Record } from '../utils/ov2';
import type { Point } from 'src/store/map';

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup() {
    const leftDrawerOpen = ref(false);
    const file = ref<File | null>(null);

    return {
      file,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      }
    };
  },
  methods: {
    addPoint() {
      this.$store.dispatch('map/push', {
        id: uid(),
        title: 'Nuovo punto'
      });
    },
    importPoints() {
      if (!this.file) return;

      const currentFile = this.file;
      const reader = new FileReader();
      const importStatus = this.$q.notify({
        type: 'primary',
        message: 'Importazione avviata...',
        group: false,
        timeout: 0,
        spinner: true
      });

      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (!event.target?.result) return;

        importOV2(event.target.result as ArrayBuffer)
          .then((records: OV2Record[]) => {
            return new Promise<Point[]>((resolve) => {
              const points: Point[] = [];
              const errors: string[] = [];

              importStatus({
                message: 'Caricamento record...',
                caption: '0%'
              });

              for (const record of records) {
                if (record.lng && record.lat) {
                  const info =
                    record.info || currentFile.name.replace(/\.[^/.]+$/, '');

                  points.push({
                    id: uid(),
                    title: info,
                    center: [record.lat, record.lng]
                  });
                } else {
                  errors.push(
                    `The record "${record.record}" misses properties!`
                  );
                }
              }

              resolve(points);
            });
          })
          .then((points: Point[]) => {
            return new Promise<void>((resolve) => {
              let i = 0;
              const step = 100;

              importStatus({
                message: 'Registrazione punti...',
                caption: '0%'
              });

              const interval = setInterval(() => {
                const min = i * step;
                const max = Math.min((i + 1) * step, points.length);

                if (max >= points.length) {
                  clearInterval(interval);
                  resolve();
                }

                importStatus({
                  caption: `${Math.floor((max * 100) / points.length)}%`
                });

                this.$store.dispatch(
                  'map/pushMultiple',
                  points.slice(min, max)
                );
                ++i;
              }, 500);
            });
          })
          .catch((error: Error) => {
            this.$q.notify({
              type: 'negative',
              message: error.message,
              timeout: 2500,
              progress: true
            });
          })
          .then(() => {
            importStatus({
              icon: 'done',
              spinner: false,
              message: 'Importazione terminata!',
              timeout: 2500,
              progress: true
            });
          });
      };

      reader.readAsArrayBuffer(currentFile);
    }
  }
});
</script>
