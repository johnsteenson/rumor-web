import { Dimension } from '@/types/geometry';

export interface ProjectState {
  title: string;
  offline: boolean,
  loggedIn: boolean,
  defaultTileSize: Dimension;
  signedInUser: string;
}

