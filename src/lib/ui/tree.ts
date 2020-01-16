import { Nullable } from '@/types/primitives';


export interface TreeItem {
  id: string;
  label: string;
  icon?: string;
  disableSelect?: boolean;
  children?: TreeItem[];
};

export interface TreeState {
  selected: Nullable<string>;
  collapsed: any;
}
