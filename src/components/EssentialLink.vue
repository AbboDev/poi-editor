<template>
  <q-item clickable @click="setCenter">
    <q-item-section>
      <q-item-label>
        {{ titleLocal }}
        <q-popup-edit
          v-model="titleLocal"
          auto-save
          v-slot="scope"
          @save="update"
        >
          <q-input
            v-model="scope.value"
            dense
            autofocus
            :label="$t('points.editTitle')"
            @keyup.enter="scope.set"
          >
            <template #append>
              <q-icon name="edit" />
            </template>
          </q-input>
        </q-popup-edit>
      </q-item-label>

      <q-item-label caption>
        {{ coordinates }}
      </q-item-label>
    </q-item-section>

    <q-item-section side>
      <q-btn
        round
        color="primary"
        icon="delete"
        :aria-label="$t('points.delete')"
        :title="$t('points.delete')"
        @click="remove"
      />
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    coordinates: {
      type: Array as PropType<number[]>,
      default: () => []
    },
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      titleLocal: this.title as string
    };
  },
  methods: {
    update(value: string) {
      this.$store.dispatch('map/update', {
        id: this.id,
        data: {
          title: value
        }
      });
    },
    remove() {
      this.$store.dispatch('map/remove', this.id);
    },
    setCenter() {
      this.$store.dispatch('map/updateCenterById', this.id);
    }
  }
});
</script>
