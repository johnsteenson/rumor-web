<template>
  <div class="login-contents">
    <div class="login-box">
      <Card title="Sign In">
        <label for="login-user">Username:</label>
        <input v-model="username" id="login-user" type="text" />
        <label for="login-pass">Password:</label>
        <input v-model="password" id="login-password" type="password" />

        <button type="button" @click="login" class="btn btn-primary">Login</button>
        <button type="button" @click="useOffline" class="btn btn-secondary">Offline Mode</button>
        <span class="login-error" v-if="errorMsg">{{errorMsg}}</span>
      </Card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Getter, namespace } from "vuex-class";
import Card from "@/components/ui/Card.vue";

import { createLocalInterface, createServiceInterface } from "@/service/rumor";
import { signIn, signInWithToken } from "@/service/signIn";

const project = namespace("project");

@Component({
  components: {
    Card
  }
})
export default class App extends Vue {
  @project.Mutation("setLoggedIn") setLoggedIn!: Function;
  @project.Mutation("setOffline") setOffline!: Function;

  private username: string = "";
  private password: string = "";
  private errorMsg: string = "";

  public mounted() {}

  public async login() {
    if (!this.username || !this.password) {
      this.errorMsg = "Must specify a username and password.";
      return;
    }
    signIn(this.username, this.password)
      .then((token: string) => {
        createServiceInterface(token).then(() => {
          window.localStorage.setItem("token", token);
          this.setOffline(false);
          this.setLoggedIn(true);
        });
      })
      .catch(err => {
        this.errorMsg = "Invalid username or password";
      });

    try {
      const res = await signIn(this.username, this.password);
    } catch (err) {}
  }

  public async useOffline() {
    await createLocalInterface();

    this.setOffline(true);
    this.setLoggedIn(true);
  }
}
</script>

<style>
.login-contents {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

label {
  font-weight: bold;
}

input {
  margin-bottom: 8px;
}

label,
input {
  display: block;
  padding: 4px;
}

button {
  margin-top: 8px;
  margin-right: 8px;
}

.login-box {
  margin-left: 40%;
  margin-top: 15%;
  width: 210px;
}

.login-error {
  margin-top: 4px;
  font-weight: bold;
  display: block;
  color: #bb0000;
}
</style>
