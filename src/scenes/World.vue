<template>
  <div class="world">
    <div class="container">
      <div class="world-tile-selector">
        <TilePalette
          :tilesetView="tilesetView"
          @tile-selected="tileSelected"
        >
        </TilePalette>
      </div>

      <div class="world-map-editor">
        <MapEditor
          :mapView="mapView"
        >
        </MapEditor>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { Getter, namespace } from 'vuex-class';
import MapEditor from '@/components/world/MapEditor.vue';
import TilePalette from '@/components/world/TilePalette.vue';
import { Tileset, TilesetView } from '@/types/tileset';
import { MapView } from '../types/map';

const world = namespace('world');

@Component({
  components: {
    MapEditor,
    TilePalette
  },
})
export default class World extends Vue {
  @Getter('getTileset', {namespace: 'world'}) tileset!: Tileset;

  @world.Getter('getTilesetView') tilesetView!: TilesetView;

  @world.Getter('getMapView') mapView!: MapView;

  @world.Mutation('selectTileIndices') selectTileIndices: any;

  tileSelected(selectedTileIndices: number[]) {
    this.selectTileIndices(selectedTileIndices);
  }
}

</script>

<style scoped>

div.world {
  position: relative;
  width: 100%;
  height: 100%;
  
}

div.container {
  display: grid;
  grid-template-columns: 2fr 10fr;
}

.world-tile-selector {
  grid-column-start: 1;
  grid-column-end: 2;
}

.world-map-editor {
  grid-column-start: 2;
  grid-column-end: 3;
}

</style>
