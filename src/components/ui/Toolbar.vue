<template>
  <div class="toolbar">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

@Component
export default class Toolbar extends Vue {}
</script>

<style scoped>
div.toolbar {
  width: 100%;
  background-color: #ccc;
  padding: 0 3px 1px 3px;
  margin: 0;
}
</style>
