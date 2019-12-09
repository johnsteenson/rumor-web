<template>
  <div class="card-container">
    <div class="card-header">{{ title }}</div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { namespace } from "vuex-class";

@Component
export default class Card extends Vue {
  @Prop() title!: string;
}
</script>

<style scoped>
.card-container {
  width: 100%;
  border: #ddd 1px solid;
  padding: 10px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
}

.card-header {
  font-size: 1.35em;
  font-weight: bold;
  border-bottom: #ddd 1px solid;
  background-color: #eee;
  margin: -10px -10px 0 -10px;
  padding: 5px 10px;
}

.card-body {
  margin-top: 10px;
}
</style>
