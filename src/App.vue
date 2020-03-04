<template>
  <div id="app">
    <BrowserCheck />
    <div class="app-contents" v-if="loggedIn">
      <Header />
      <router-view />
    </div>
    <Login v-if="redirectToLogin && !loggedIn" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter, namespace } from "vuex-class";

import Header from "@/components/Header.vue";
import Login from "@/Login.vue";
import BrowserCheck from "@/components/BrowserCheck.vue";

import { signIn, signInWithToken } from "@/service/signIn";
import { getServiceInterface } from "@/service/rumor";

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
  @project.Mutation("setOffline") setOffline!: Function;

  private redirectToLogin: boolean = false;

  public mounted() {
    const token = window.localStorage.getItem("token");
    if (token) {
      signInWithToken(token)
        .then(() => {
          getServiceInterface()
            .connect(token)
            .then(() => {
              this.setOffline(false);
              this.setLoggedIn(true);
            })
            .catch(() => {
              this.redirectToLogin = true;
            });
        })
        .catch(err => {
          window.localStorage.removeItem("token");
          this.redirectToLogin = true;
        });
    } else {
      this.redirectToLogin = true;
    }
  }
}
</script>

<style>
.app-contents {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
}
</style>
