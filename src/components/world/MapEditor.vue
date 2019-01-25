<template>
  <canvas width="300" height="600">
  </canvas>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class MapEditor extends Vue {

  public mounted() {

  }
}

/*
import MapEditor from '@/canvas/mapEditor';
import { mapState } from 'vuex';

export default {
  name: 'r-map-editor',

  computed: mapState({
    layer: state => state.world.map.layer,
  }),

  props: ['tileset'],

  mounted() {
    const $this = this;
    this.$canvas = this.$el;
    this.tilePalette = new MapEditor(this.$canvas, this.$store);
    this.boundingRect = this.$canvas.getBoundingClientRect();

    this.$nextTick(() => {
      this.$forceUpdate();
    });

    /*
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
    if (this.layer) {
      console.log(this.layer[1]);
    }
    /*
    if (this.tileset && this.tileSize) {
      this.tilePalette.loadTileset(this.tileset, this.tileSize);
    }
    
  },

};
*/

</script>

<style>

</style>
