<template>
  <div id="header">
    <div>
      <h1>
        Rumor
        <span v-if="isOffline">(Offline Mode)</span>
      </h1>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { namespace } from "vuex-class";

const project = namespace("project");

@Component
export default class Header extends Vue {
  @project.State("offline") isOffline!: boolean;
}
</script>

<style scoped>
#header {
  width: 100%;
  color: #fff;
  background-color: #444444;
  height: 1.2rem;
  margin-bottom: 2px;
}

#header div {
  display: flex;
}

#header h1 {
  font-size: 1.1rem;
  margin: 0 0 0 0.3rem;
}

span {
  font-size: 0.9rem;
}
</style>
