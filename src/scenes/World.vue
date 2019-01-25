<template>
  <div class="container">
    It's the world!!!

    <div class="world-tile-selector">
      <TilePalette
        :tileset="tileset"
        @tile-selected="tileSelected"
      >
      </TilePalette>
    </div>

    <div class="world-map-editor">
      <MapEditor>
      </MapEditor>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import MapEditor from '@/components/world/MapEditor.vue';
import TilePalette from '@/components/world/TilePalette.vue';
import { Tileset } from '@/types/tileset';

@Component({
  components: {
    MapEditor,
    TilePalette
  },
})
export default class World extends Vue {
  @Getter('getTileset', {namespace: 'world'}) tileset!: Tileset;

  tileSelected() {
    console.log('Tiles selected!');
  }

}

/*
      <tile-palette
        :tileset="tileset"
        @tile-selected="tileSelected"
      >
      </tile-palette>
*/

/*
import TilePalette from '@/components/world/TilePalette.vue';
import MapEditor from '@/components/world/MapEditor.vue';

import { mapState } from 'vuex';

export default {
  name: 'World',

  computed: mapState({
    tileset: state => state.world.tileset,
  }),

  methods: {
    tileSelected(tilesSelected) {
      console.log(tilesSelected);
    },
  },

  components: {
    TilePalette,
    MapEditor,
  },
};
*/

</script>

<style scoped>

div {
  display: grid;
}

.world-tile-selector {
  grid-column-start: 1;
  grid-column-end: 2;
}

.world-map-editor {
  grid-column-start: 3;
  grid-column-end: 12;
}

</style>
