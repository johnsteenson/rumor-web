import { MapStore } from '@/world/map';
import { blockReactivity } from '@/lib/vueUtils';

const mapStore = new MapStore();
blockReactivity(mapStore);

export { mapStore };
