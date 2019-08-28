<template>
  <div>
    <canvas 
      width="200" 
      height="300">
    </canvas>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import { ImageManager } from '@/canvas/imageManager';
import { Tileset, TilesetView, TileAnim, TilesetSection, Tile, TemplateTile } from '@/types/tileset';
import { TileImage } from '@/canvas/tileImage';
import { Rect, TileSize } from '@/types/primitives';
import { TileSelection } from '../../types/map';

const world = namespace('world');

@Component
export default class TilesetBase extends Vue {
  protected canvas!: HTMLCanvasElement;
  protected context!: CanvasRenderingContext2D;
  protected image!: TileImage;
  protected section!: TilesetSection;
  protected tilesPerRow: number = 0;

  @Prop() protected tilesetView!: TilesetView;

  @Prop() protected disableCanvasResize!: boolean;

  @Watch('tilesetView', { immediate: true, deep: true }) tilesetChange(view: TilesetView) {
    this.loadTilesetView(view);
  }
  
  public mounted() {
    this.canvas = this.$el.getElementsByTagName('canvas')[0] as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    this.$nextTick(() => {
      this.$forceUpdate();
    })
  }

  public async loadTilesetView(view: TilesetView) {
    this.tilesetView = view;
    this.section = view.tileset.sections[view.curSection];
    this.image = await ImageManager.getInstance().getTileImage(`/images/${this.section.imageFile}`, view.tileSize);

    if (!this.disableCanvasResize) {
      this.canvas.width = view.tileSize.scaledW * this.section.tilesPerRow;
      this.canvas.height = this.image.height;
    }

    this.tilesPerRow = this.section.tilesPerRow; // Math.floor(this.canvas.width / view.tileSize.scaledW);
    this.draw();
  }

  public drawTiles() {
    if (!this.tilesetView || !this.image) {
      return;
    }

    const tileset: Tileset = this.tilesetView.tileset,
      tileSize: TileSize = this.tilesetView.tileSize,
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
      tileIndex = Array.isArray(templateTile.tile) ? templateTile.tile[0] : templateTile.tile;
      tile = section.tiles[tileIndex];
      imgTileIndex = Array.isArray(tile.t) ? tile.t[0] : tile.t;

      this.image!.drawTile(this.context, sx, sy, imgTileIndex);
      sx = sx + tileSize.scaledW;
      k++;
    }
  }

  public draw() {
    this.drawTiles();
  }

}

</script>

<style scoped>
  div {
    width: 100%;
    overflow: scroll;

    border: 1px;
    border-style: groove solid;
  }

  canvas {
    width: 100%;
  }

</style>
