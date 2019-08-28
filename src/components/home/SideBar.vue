<template>
  <div>
    <ul>
      <li>World<br/>Make the World</li>
      <li>About<br/>About Rumor</li>
    </ul>
  </div>
</template>

<script lang="ts">

import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SideBar extends Vue {

}

</script>

<style scoped>

ul {
  margin-block-start: 0;
  margin-block-end: 0;
}

div {
  background-color: #eee;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 10px;
}

</style>
