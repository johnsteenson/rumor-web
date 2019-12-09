<template>
  <Card title="About">
    <ul>
      <li>
        <EarthIcon />
        <a href="https://webrpg.dev/" target="_blank">webrpg.dev</a>
      </li>
      <li>
        <GithubIcon />
        <a href="https://github.com/johnsteenson/rumor-web" target="_blank">rumor-web</a>
      </li>
    </ul>
  </Card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import Card from "@/components/ui/Card.vue";
import { namespace } from "vuex-class";

import GithubIcon from "vue-material-design-icons/GithubCircle.vue";
import EarthIcon from "vue-material-design-icons/Earth.vue";

@Component({
  components: {
    Card,
    GithubIcon,
    EarthIcon
  }
})
export default class UpdateList extends Vue {}
</script>

<style scoped>
h4 {
  margin-bottom: 0.01em;
}

ul {
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0px;
}

li {
  list-style-type: none;
}

a {
  margin-left: 4px;
}
</style>
