<template>
  <div>
    <div>
      <Card title="Rumor">
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
      </Card>
    </div>

    <div>
      <UpdateList />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Card from "@/components/ui/Card.vue";
import UpdateList from "@/components/home/UpdateList.vue";
import SideBar from "@/components/home/SideBar.vue";

@Component({
  components: {
    Card,
    UpdateList,
    SideBar
  }
})
export default class Home extends Vue {}
</script>

<style>
.home {
  display: flex;
  flex-direction: row;
}

.home-cell-1 {
  flex-grow: 1;
}

.home-cell-2 {
  flex-grow: 1;
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
