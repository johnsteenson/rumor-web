<template>
  <div id="app">
    <BrowserCheck/>
    <Header/>
    <router-view/>
  </div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import Header from '@/components/Header.vue';
import BrowserCheck from '@/components/BrowserCheck.vue';

@Component({
  components: {
    Header,
    BrowserCheck
  },
})
export default class App extends Vue {

}

</script>

<style>

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}



</style>
