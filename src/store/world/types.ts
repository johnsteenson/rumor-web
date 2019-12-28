import { Dimension } from '@/types/geometry';
import { TileMap, TileChange, ToolType, TileSelection } from '@/types/map';
import { Tileset, Tile } from '@/types/tileset';

export interface WorldState {
  tool: ToolType;
  tileSelection: TileSelection;
  curSection: number;
  curLayer: number;
  mapScale: number;
  componentScale: number;
  changes: TileChange[];
}
