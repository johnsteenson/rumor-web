<template>
  <div class="map-base">
    <canvas
      @mousedown="mouseDown" 
      @mousemove="mouseMove" 
      @mouseup="mouseUp"
      @contextmenu="contextMenu"
      width="400" 
      height="300">
    </canvas>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { TileSize, Rect, Point } from '@/types/primitives';
import { MapView, TileChangeEntry, ToolType, TileDrawData, TileDraw } from '../../types/map';

import MapBase from './MapBase.vue';

import { namespace } from 'vuex-class';

const world = namespace('world');

@Component
export default class MapEditor extends MapBase {
  @world.Action('newTileChange') newTileChange: any;
  @world.Action('pencil') pencil: any;
  @world.Action('undo') undo: any;

  private baseCoor!: Rect;
  private lastDrawCoor!: Point;

  private isMouseDown!: boolean;

  private created() {
    this.baseCoor = {} as Rect;
    this.lastDrawCoor = {x: -1, y: -1};
    this.isMouseDown = false;
  }

  public drawSelectedTiles(clientX: number, clientY: number) {
    const boundingRect = this.canvas.getBoundingClientRect(),
      xScale = (boundingRect.right - boundingRect.left) / this.canvas.width,
      yScale = (boundingRect.bottom - boundingRect.top) / this.canvas.height;

    this.baseCoor.l = clientX - boundingRect.left - this.mapOffset.x;
    this.baseCoor.t = clientY - boundingRect.top - this.mapOffset.y;
    this.baseCoor.r = 0;
    this.baseCoor.b = 0;

    const map = this.map,
      x = Math.floor(this.baseCoor.l / this.tileSize.scaledW),
      y = Math.floor(this.baseCoor.t / this.tileSize.scaledH),
      section = this.mapView.tileset.sections[this.mapView.curSection],
      tileIndex = this.mapView.tileSelection.tileIndices[0],
      templateTile = section.templateTiles[tileIndex],
      tile = section.tiles[tileIndex].t,
      tileDisplayIndex = Array.isArray(tile) ? tile[0] : tile;

    if (this.lastDrawCoor.x === x && this.lastDrawCoor.y === y) {
      return;
    }

    this.lastDrawCoor.x = x;
    this.lastDrawCoor.y = y;

    const tileDraw: TileDraw = {
      x,
      y,
      w: 1,
      h: 1,
      l: 0,
      data: [
        {
          s: this.mapView.curSection,
          t: tileIndex
        }
      ]
    };

    this.pencil(tileDraw);
  }

  public mouseDown(event: MouseEvent) {
    switch(event.button) {
      case 0:
        this.isMouseDown = true;

        this.newTileChange();
        this.drawSelectedTiles(event.clientX, event.clientY);
        break;

      case 2:
        this.undo();

        break;
    }
    
    this.refresh();
  }

  public mouseUp(event: MouseEvent) {
    this.isMouseDown = false;
    this.lastDrawCoor.x = -1;
    this.lastDrawCoor.y = -1;
  }

  public mouseMove(event: MouseEvent) {
    if (this.isMouseDown) {
      this.drawSelectedTiles(event.clientX, event.clientY);
    }

  }

  public contextMenu(event: MouseEvent) {
    event.preventDefault();
  }

}

</script>

<style>

</style>
