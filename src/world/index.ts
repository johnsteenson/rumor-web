import { MapStore } from '@/world/map';
import { createMap } from '@/lib/world/tilemap';
import { blockReactivity } from '@/lib/vueUtils';

import socketClient from '@/service/socket';

const mapStore = new MapStore();
// mapStore.map = createMap("My Kewl Map", 100, 100, tileset);
blockReactivity(mapStore);

export { mapStore };
