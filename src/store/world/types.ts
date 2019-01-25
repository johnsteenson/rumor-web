import {Dimension} from '@/types/primitives';
import {Map, Tool} from '@/types/map';
import {Tileset} from '@/types/tileset';

export interface WorldState {
  map: Map;
  tool: Tool;
  tileset: Tileset;
  mapScale: number,
  componentScale: number,
}
