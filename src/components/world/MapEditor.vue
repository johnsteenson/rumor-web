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
import { MapView, TileChangeEntry } from '../../types/map';

import MapBase from './MapBase.vue';

import { namespace } from 'vuex-class';

const world = namespace('world');

@Component
export default class MapEditor extends MapBase {
  @world.Mutation('newTileChange') newTileChange: any;
  @world.Mutation('setTile') setTile: any;
  @world.Mutation('undo') undo: any;

  private baseCoor = {} as Rect;
  private lastDrawCoor: Point = {x: -1, y: -1};

  private isMouseDown: boolean = false;

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
      tile = section.tiles[tileIndex].tile[0],
      tileDisplayIndex = Array.isArray(tile) ? tile[0] : tile;

    

    if (x == this.lastDrawCoor.x
         && y == this.lastDrawCoor.y) {
           return;
         }

    this.lastDrawCoor.x = x;
    this.lastDrawCoor.y = y;

    const tileChange: TileChangeEntry = {
      l: 0,
      x: x,
      y: y,
      p: 0,
      pv: 0,
      v: tileDisplayIndex
    };
    
    this.setTile(tileChange);
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
