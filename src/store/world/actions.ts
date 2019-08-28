import { ActionTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';
import { TileChangeEntry, TileDrawData, MapLayer, TileDraw } from '@/types/map';
import { TileType, TemplateTileType } from '@/types/tileset';

import { getRectangularTileIndex, visitSurroundingTiles } from '@/lib/world/autotile'
import { Point } from '@/types/primitives';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { getFirstTile } from '@/lib/world/tileset';

export const actions: ActionTree<WorldState, RootState> = {

  newTileChange({commit}) {
    commit('newTileChange');
  },

  correctAutotiles({commit, dispatch, state}, points: Point[]) {
    const w = state.map.w,
      h = state.map.h;

    let tileValue, tileIndex;

    for (let point of points) {
      const layer = state.map.layer[point.l!],
        templateTileValue = layer.templateData[point.y * w + point.x],
        unpackedVal = unpackMapBuf(templateTileValue),
        templateTile = state.tileset.sections[unpackedVal[0]].templateTiles[unpackedVal[1]];


      switch(templateTile.type) {
        case TemplateTileType.SINGLE:
          break;

        case TemplateTileType.RECTANGULAR:
          tileIndex = getRectangularTileIndex(layer, point.x, point.y, w, h, templateTileValue);
          tileValue = Array.isArray(templateTile.tile) ? templateTile.tile[tileIndex] : 0;
          commit('changeTile', {
            x: point.x,
            y: point.y,
            l: point.l,
            t: templateTileValue,
            v: tileValue,
          });
          break;
      }
    }
  },

  pencil({commit, dispatch, state}, tileDraw: TileDraw) {
    const w = state.map.w,
      h = state.map.h,
      surroundingTiles: Point[] = [];

    for(let drawData of tileDraw.data) {
      const layer = state.map.layer[tileDraw.l];
      const section = state.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      let tileValue, tileIndex;

      switch(templateTile.type) {
        case TemplateTileType.SINGLE:
          tileValue = packMapBuf(drawData.s, getFirstTile(templateTile.tile));
          commit('changeTile', {
            x: tileDraw.x,
            y: tileDraw.y,
            l: tileDraw.l,
            v: tileValue,
            t: templateTileValue,
          });

          break;

        case TemplateTileType.RECTANGULAR:
          tileIndex = getRectangularTileIndex(layer, tileDraw.x, tileDraw.y, w, h, templateTileValue);
          tileValue = Array.isArray(templateTile.tile) ? templateTile.tile[tileIndex] : 0;
          commit('changeTile', {
            x: tileDraw.x,
            y: tileDraw.y,
            l: tileDraw.l,
            t: templateTileValue,
            v: tileValue,
          });
          break;
      }

      visitSurroundingTiles(tileDraw.x, tileDraw.y, tileDraw.w, tileDraw.h, w, h, (px: number, py: number) => {
        surroundingTiles.push({
          x: px,
          y: py,
          l: tileDraw.l
        })

      });

      dispatch('correctAutotiles', surroundingTiles);
    }
  },

  undo({commit}) {
    commit('undo');
  },

};
