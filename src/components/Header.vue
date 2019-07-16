<template>
  <div id="header">
    <div>
      <h1>Rumor</h1>
    </div>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';

@Component
export default class Header extends Vue {

}

</script>

<style scoped>
  #header {
    width: 100%;
    color: #fff;
    background-color: #444444;
    height: 1.2rem;
    margin-bottom: 1.2rem;
  }

  #header div  {
    display: flex;
  }

  #header h1 {
    font-size: 1.1rem;
    margin: 0 0 0 0.1rem;
  }

  span {
    font-size: 0.6rem;
  }

</style>
