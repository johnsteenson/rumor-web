<template>
  <div class="world" v-if="mapLoaded">
    <div class="container">
      <div class="world-tile-toolbar">
        <TileToolbar />
      </div>
      <div class="world-tile-selector">
        <TilePalette
          :tilesetView="tilesetView"
          :toolView="toolView"
          :hideHScroll="true"
          @tileSelected="tileSelected"
        ></TilePalette>
      </div>

      <div class="world-map-selector">
        <MapTree />
      </div>

      <div class="world-map-editor">
        <MapEditor
          :useMapStore="true"
          :toolView="toolView"
          :tilesetView="tilesetView"
          @tileSelected="tileSelected"
        ></MapEditor>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/*
    <div style="width: 100%; height: 600px; overflow: scroll">
      <TileDebug :tilesetView="tilesetView" :disableCanvasResize="true">
      </TileDebug>
    </div>         
*/

import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { Getter, namespace } from "vuex-class";
import MapEditor from "@/components/world/MapEditor.vue";
import TilePalette from "@/components/world/TilePalette.vue";
import TileDebug from "@/components/world/TileDebug.vue";
import TileToolbar from "@/components/world/TileToolbar.vue";
import MapTree from "@/components/world/MapTree.vue";
import { Tileset, TilesetView, ToolView } from "@/types/tileset";
import { MapView, TileMap, TileSelection } from "../types/map";

import { mapStore } from "@/world";

import { getServiceInterface } from "@/service/rumor";

import tileset from "@/data/tileset-world.json";
import { RumorService } from "@/service/rumor/interface";
import { RumorServiceLocal } from "@/service/rumor/local";

const world = namespace("world"),
  project = namespace("project");

@Component({
  components: {
    MapEditor,
    MapTree,
    TilePalette,
    TileDebug,
    TileToolbar
  }
})
export default class World extends Vue {
  private mapLoaded: boolean = false;

  @world.Getter("getTilesetView") tilesetView!: TilesetView;

  @world.Getter("getToolView") toolView!: ToolView;

  @world.Mutation("selectTileIndices") selectTileIndices: any;

  @Provide("mapStore") store = mapStore;

  private mounted() {
    const service = getServiceInterface();

    service.onGetMap((mapData: any) => {
      mapStore.map = mapData;

      this.mapLoaded = true;
    });

    service.getMap("1");
  }

  tileSelected(selectedTileIndices: TileSelection) {
    this.selectTileIndices(selectedTileIndices);
  }
}
</script>

<style scoped>
div.world {
  width: 100%;
  height: 100%;
}

div.container {
  display: grid;
  grid-template-columns: 2fr minmax(0, 10fr);
  grid-template-rows: minmax(0, min-content) minmax(0, 8fr) minmax(0, 2.5fr);
  min-width: 0;
  height: 100%;
  max-height: calc(100vh - 1.2rem - 2px);
  margin: 0 4px 0 2px;
  grid-template-areas:
    "tiletoolbar mapeditor"
    "tileselector mapeditor"
    "mapselector mapeditor";
}

.world-tile-selector {
  grid-area: tileselector;
}

.world-tile-toolbar {
  grid-area: tiletoolbar;
}

.world-map-editor {
  grid-area: mapeditor;
}

.world-map-selector {
  grid-area: mapselector;
  overflow: scroll;
}
</style>
