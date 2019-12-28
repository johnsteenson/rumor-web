<template>
  <div style="width: 100%;">
    test
    <canvas width="400" height="400"></canvas>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";
import {
  TilesetView,
  Tileset,
  TilesetSection,
  TemplateTile,
  Tile
} from "@/types/tileset";
import { TileSize, Rect } from "@/types/geometry";
import TilesetBase from "./TilesetBase.vue";
import { TileSelection } from "../../types/map";

const world = namespace("world");

const TILE_DEBUG = 0;

@Component
export default class TileDebug extends TilesetBase {
  public draw() {
    if (!this.tilesetView || !this.image) {
      return;
    }

    const tileset: Tileset = this.tilesetView.tileset,
      tileSize: TileSize = this.tilesetView.tileSize,
      section: TilesetSection = this.section,
      halfW: number = tileSize.scaledW / 2,
      halfH: number = tileSize.scaledH / 2;

    let sx: number = 0,
      sy: number = 0,
      i = 0,
      k = 0,
      templateTile: TemplateTile = section.templateTiles[TILE_DEBUG],
      tiles: number[] = templateTile.tile as number[],
      tileIndex: number,
      imgTileIndex: number,
      tile: Tile;

    this.context.fillStyle = "#ffffff";
    this.context.font = "16px serif";

    for (i = 0; i < tiles.length; i++) {
      const tile: Tile = section.tiles[tiles[i]];
      const subTiles: number[] = tile.t as number[];

      if (i > 0 && i % 12 == 0) {
        sy += tileSize.scaledH;
        sx = 0;
      }

      if (Array.isArray(tile.t)) {
        const len: number = tile.flen || subTiles.length;
        let quarter: number = tile.quarter || 255;

        for (k = 0; k < len; k++) {
          this.image!.drawSubTiles(this.context, sx, sy, subTiles[k], quarter);
          quarter = quarter >> 4;
        }
      } else {
        this.image!.drawTile(this.context, sx, sy, tile.t as number);
      }

      this.context.fillText(`${i}`, sx + halfW - 6, sy + halfH + 6);

      sx += tileSize.scaledW;
    }
  }
}
</script>

<style>
</style>
