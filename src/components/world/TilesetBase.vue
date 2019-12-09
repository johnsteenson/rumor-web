<template>
  <div>
    <canvas class="drawable" width="200" height="200"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";
import { ImageManager } from "@/canvas/imageManager";
import {
  Tileset,
  TilesetView,
  TileAnim,
  TilesetSection,
  Tile,
  TemplateTile
} from "@/types/tileset";
import { TileImage } from "@/canvas/tileImage";
import { Rect, TileSize } from "@/types/primitives";
import { TileSelection } from "../../types/map";

import CanvasBase from "./CanvasBase.vue";

const world = namespace("world");

@Component
export default class TilesetBase extends CanvasBase {
  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;
  protected image!: TileImage;
  protected section!: TilesetSection;
  protected tilesPerRow: number = 0;

  protected tileSize: TileSize = {
    w: 0,
    h: 0,
    scaledW: 0,
    scaledH: 0,
    scale: 0
  };

  @Prop() protected tilesetView!: TilesetView;

  @Prop() protected disableCanvasResize!: boolean;

  @Watch("tilesetView", { immediate: true, deep: true }) tilesetChange(
    view: TilesetView
  ) {
    this.$nextTick(() => {
      this.loadTilesetView(view);
    });
  }

  public mounted() {
    this.canvas = this.$el.getElementsByTagName(
      "canvas"
    )[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;

    this.$nextTick(() => {
      this.$forceUpdate();
    });
  }

  public async loadTilesetView(view: TilesetView) {
    this.tilesetView = view;
    this.section = view.tileset.sections[view.curSection];

    this.tileSize = view.tileSize;

    this.image = await ImageManager.getInstance().getTileImage(
      `/images/${this.section.imageFile}`,
      view.tileSize
    );

    if (!this.disableCanvasResize) {
      this.setMaxDrawArea(
        view.tileSize.scaledW * this.section.tilesPerRow,
        9999
      );

      this.forceResizeEvent();
    }

    this.tilesPerRow = this.section.tilesPerRow; // Math.floor(this.canvas.width / view.tileSize.scaledW);
    this.draw();
  }

  public drawTiles() {
    if (!this.tilesetView || !this.image) {
      return;
    }

    const tileset: Tileset = this.tilesetView.tileset,
      tileSize: TileSize = this.tileSize,
      section: TilesetSection = this.section;

    let sx: number = 0,
      sy: number = 0,
      i = 0,
      k = 0,
      templateTile: TemplateTile,
      tileIndex: number,
      imgTileIndex: number,
      tile: Tile;

    for (i = 0; i < section.templateTiles.length; i++) {
      if (k > 0 && k % section.tilesPerRow === 0) {
        sx = 0;
        sy = sy + tileSize.scaledH;
      }

      templateTile = section.templateTiles[i];
      tileIndex = Array.isArray(templateTile.tile)
        ? templateTile.tile[0]
        : templateTile.tile;
      tile = section.tiles[tileIndex];
      imgTileIndex = Array.isArray(tile.t) ? tile.t[0] : tile.t;

      this.image!.drawTile(this.context, sx, sy, imgTileIndex);
      sx = sx + tileSize.scaledW;
      k++;
    }

    const rect = this.$el.getBoundingClientRect();

    // this.drawScrollbars();
  }

  protected onResize() {
    this.drawTiles();
  }

  public draw() {
    this.drawTiles();
  }
}
</script>

<style scoped>
div {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;

  border: 1px;
  border-style: groove solid;
  box-sizing: border-box;
  padding: 0 0 1px 0;
}
</style>
