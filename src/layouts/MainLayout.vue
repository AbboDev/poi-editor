<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="$t('menu.label')"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>{{ $t('app.title') }}</q-toolbar-title>

        <q-btn-dropdown
          flat
          dense
          round
          icon="language"
          :aria-label="$t('languages.enUS')"
          class="q-mr-xs"
        >
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="setLocale('en-US')"
              :active="locale === 'en-US'"
            >
              <q-item-section>{{ $t('languages.enUS') }}</q-item-section>
            </q-item>
            <q-item
              clickable
              v-close-popup
              @click="setLocale('it')"
              :active="locale === 'it'"
            >
              <q-item-section>{{ $t('languages.it') }}</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn
          icon="add_location_alt"
          :title="$t('points.add')"
          :aria-label="$t('points.add')"
          @click="addPoint"
          round
          flat
          color="white"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="column no-wrap full-height">
        <q-item-label header>{{ $t('points.title') }}</q-item-label>

        <q-item clickable v-ripple @click="addPoint">
          <q-item-section avatar>
            <q-icon name="add_location_alt" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ $t('points.add') }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-file
              clearable
              borderless
              v-model="file"
              :label="$t('points.importInputLabel')"
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
                  :title="$t('points.import')"
                  :aria-label="$t('points.import')"
                  @click="importPoints"
                />
              </template>
            </q-file>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-scroll-area class="full-height">
          <EssentialLink
            v-for="(item, index) in mapStore.points"
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
import { useI18n } from 'vue-i18n';
import EssentialLink from 'components/EssentialLink.vue';
import { importOV2, OV2Record } from '../utils/ov2';
import { useMapStore, Point } from 'src/stores/map';

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup() {
    const { t, locale } = useI18n();
    const mapStore = useMapStore();
    const leftDrawerOpen = ref(false);
    const file = ref<File | null>(null);

    const setLocale = (lang: string) => {
      locale.value = lang;
    };

    return {
      t,
      file,
      locale,
      mapStore,
      setLocale,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      }
    };
  },
  methods: {
    addPoint() {
      this.mapStore.push({
        id: uid(),
        title: this.$t('points.newPoint')
      });
    },
    importPoints() {
      if (!this.file) return;

      const currentFile = this.file;
      const reader = new FileReader();
      const importStatus = this.$q.notify({
        type: 'primary',
        message: this.$t('points.importStarted'),
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
                message: this.$t('points.loadingRecords'),
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
                    this.$t('points.recordMissingProperties', {
                      record: record.record
                    })
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
                message: this.$t('points.savingPoints'),
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

                this.mapStore.pushMultiple(points.slice(min, max));
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
              message: this.$t('points.importFinished'),
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
