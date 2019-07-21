<template>
  <div class="home">
    <div>
      Welcome to Rumor.  Create your dream 2D RPG with your friends.  
      Only your imagination is the limit!
    </div>
    <div>
      <ul>
        <li>
          <router-link to="/world">World</router-link> - Build the world you dream of!
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class Home extends Vue {}
</script>

<style>
  li {
    list-style-type: none;
  }
</style>
