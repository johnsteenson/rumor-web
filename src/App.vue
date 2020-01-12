<template>
  <div id="app">
    <BrowserCheck />
    <div class="app-contents" v-if="loggedIn">
      <Header />
      <router-view />
    </div>
    <Login v-else />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter, namespace } from "vuex-class";

import Header from "@/components/Header.vue";
import Login from "@/Login.vue";
import BrowserCheck from "@/components/BrowserCheck.vue";

import { createServiceInterface } from "@/service/rumor";

const project = namespace("project");

@Component({
  components: {
    BrowserCheck,
    Header,
    Login
  }
})
export default class App extends Vue {
  @project.State("loggedIn") loggedIn!: boolean;

  @project.Mutation("setLoggedIn") setLoggedIn!: Function;

  public mounted() {
    // TODO Store JWT in local storage, and automatically sign in if present.
  }
}
</script>

<style>
.app-contents {
  display: flex;
  flex-direction: column;
  height: 100%;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
</style>
