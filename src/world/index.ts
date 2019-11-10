import { MapStore } from '@/world/map';
import { createMap } from '@/lib/world/tilemap';
import tileset from "@/data/tileset-world.json";
import { blockReactivity } from '@/lib/vueUtils';

const mapStore = new MapStore();
mapStore.map = createMap("My Kewl Map", 100, 100, tileset);
blockReactivity(mapStore);

export { mapStore };
