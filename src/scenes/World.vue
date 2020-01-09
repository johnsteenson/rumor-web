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

      <div class="world-map-selector">Map Selector goes here</div>

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
import { Tileset, TilesetView, ToolView } from "@/types/tileset";
import { MapView, TileMap, TileSelection } from "../types/map";

import { mapStore } from "@/world";

import socketClient from "@/service/socket";
import { createLayers } from "../lib/world/tilemap";

import tileset from "@/data/tileset-world.json";

const world = namespace("world");

@Component({
  components: {
    MapEditor,
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
    socketClient.on("getMap", (mapData: any) => {
      console.log("Received map", mapData);

      const map: TileMap = mapData as TileMap;
      map.layer = createLayers(map.w, map.h, 2, map.buffer);
      map.tileset = tileset;
      mapStore.map = map;

      this.mapLoaded = true;
    });
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
  grid-template-rows: min-content 8fr 2fr;
  min-width: 0;
  height: 100%;
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
}
</style>
