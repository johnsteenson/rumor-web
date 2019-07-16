import {Dimension} from '@/types/primitives';
import {TileMap, TileChange, ToolType, TileSelection} from '@/types/map';
import {Tileset, Tile} from '@/types/tileset';

export interface WorldState {
  map: TileMap;
  tool: ToolType;
  tileSelection: TileSelection;
  tileset: Tileset;
  curSection: number;
  mapScale: number,
  componentScale: number,
  changes: TileChange[],
}
