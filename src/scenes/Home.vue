<template>
  <div class="home">
    <div class="home-cell-1">
      <Card title="Welcome">
        <p>
          Welcome to Rumor--the web-based RPG creation platform. Create your dream 2D RPG with your friends.
          Only your imagination is the limit!
        </p>
        <p>
          <b>Note:</b> This app is currently supported for
          <a
            href="https://www.mozilla.org/"
            target="_blank"
          >Mozilla Firefox</a>
          and
          <a href="https://www.google.com/chrome/" target="_blank">Google Chrome</a>.
          We cannot guarantee this will work with any other browser at this time.
          If it doesn't work, please download
          <a
            href="https://www.mozilla.org/"
            target="_blank"
          >Firefox</a>
          or
          <a href="https://www.google.com/chrome/" target="_blank">Chrome</a>.
        </p>
        <p>Where do you want to go today?</p>
        <ul>
          <li>
            <router-link to="/world">World</router-link>- Design the levels. Create the world you'll be playing in.
          </li>
          <li>
            <b>Lore</b> - Craft the characters, monsters, and items. (Coming Soon)
          </li>
        </ul>
        <p>
          This app was last updated on
          <b>{{buildDate}}</b>
        </p>
      </Card>
    </div>

    <div class="home-cell-2">
      <Links />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Card from "@/components/ui/Card.vue";
import Links from "@/components/home/Links.vue";
import SideBar from "@/components/home/SideBar.vue";

declare var process: {
  env: {
    BUILD_DATE: String;
  };
};

@Component({
  components: {
    Card,
    Links,
    SideBar
  }
})
export default class Home extends Vue {
  private buildDate: String = process.env.BUILD_DATE;
}
</script>

<style>
.home {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min-content, 1fr));
  grid-gap: 20px;
  padding: 15px 40px 10px 35px;
  grid-auto-flow: row;
}

@media (min-width: 800px) {
  .home-cell-1 {
    grid-column-start: 1;
    grid-column-end: 5;
  }

  .home-cell-2 {
    grid-column-start: 5;
    grid-column-end: 6;
  }
}

@media (max-width: 800px) {
  .home-cell-1 {
    grid-column-start: 1;
    grid-column-end: 5;
    grid-row-start: 1;
    grid-row-end: 2;
  }

  .home-cell-2 {
    grid-column-start: 1;
    grid-column-end: 5;
    grid-row-start: 2;
    grid-row-end: 3;
  }
}

a {
  color: #0000ff;
  font-weight: bold;
}

a:hover {
  color: #009900;
  font-weight: bold;
}

ul {
  list-style: none;
}

li {
  margin-bottom: 0.2em;
}
</style>
