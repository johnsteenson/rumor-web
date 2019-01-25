<template>
  <canvas width="300" height="600">
  </canvas>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { Tileset } from '@/types/tileset';

@Component
export default class TilePalette extends Vue {
  @Prop() private tileset!: Tileset;
  

  public mounted() {
    
  }
}

/*
import TilePalette from '@/canvas/tilePalette';
import { mapState } from 'vuex';

export default {
  name: 'r-tile-palette',

  computed: mapState({
    tileSize: state => state.project.tileSize,
  }),

  props: ['tileset'],

  mounted() {
    const $this = this;
    this.$canvas = this.$el;
    this.tilePalette = new TilePalette(this.$canvas, this.$store);
    this.boundingRect = this.$canvas.getBoundingClientRect();

    this.$nextTick(() => {
      this.$forceUpdate();
    });

    this.$canvas.addEventListener('mousedown', (event) => {
      $this.baseCoor = {
        l: event.clientX - $this.boundingRect.left,
        t: event.clientY - $this.boundingRect.top,
      };

      $this.baseCoor.r = $this.baseCoor.l + $this.tileSize.scaledW;
      $this.baseCoor.b = $this.baseCoor.t + $this.tileSize.scaledH;
      $this.selectedTiles = $this.tilePalette.selectTilesInRegion(
        $this.baseCoor.l,
        $this.baseCoor.t,
        $this.baseCoor.r,
        $this.baseCoor.b,
      );
      $this.mouseDown = true;

      $this.$emit('tile-selected', $this.selectedTiles);
    });

    this.$canvas.addEventListener('mouseup', (event) => {
      $this.mouseDown = false;

      // TODO Add ability to select multiple tiles
    });

    this.$canvas.addEventListener('mousemove', (event) => {
      if ($this.mouseDown) {
        // TODO Add ability to select multiple tiles
        // console.log(event);
      }
    });
  },

  beforeUpdate() {
    if (this.tileset && this.tileSize) {
      this.tilePalette.loadTileset(this.tileset, this.tileSize);
    }
  },

};
*/
</script>

<style>

</style>
