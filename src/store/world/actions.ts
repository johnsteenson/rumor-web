import { ActionTree } from 'vuex';
import { WorldState } from './types';
import { RootState } from '../types';
import { TileChangeEntry, TileDrawData, MapLayer, TileDraw } from '@/types/map';
import { TileType, TemplateTileType } from '@/types/tileset';

import { getRectangularTileIndex, visitSurroundingTiles, getWaterTileIndex, calculateTileValue } from '@/lib/world/autotile';
import { Point } from '@/types/primitives';
import { unpackMapBuf, packMapBuf } from '@/lib/world/tilemap';
import { getFirstTile } from '@/lib/world/tileset';

export const actions: ActionTree<WorldState, RootState> = {

  newTileChange({ commit }) {
    commit('newTileChange');
  },

  correctAutotiles({ commit, dispatch, state }, points: Point[]) {
    const w = state.map.w,
      h = state.map.h;

    let tileValue;

    for (const point of points) {
      const layer = state.map.layer[point.l!],
        templateTileValue = layer.templateData[point.y * w + point.x],
        unpackedVal = unpackMapBuf(templateTileValue),
        templateTile = state.tileset.sections[unpackedVal[0]].templateTiles[unpackedVal[1]];

      if (templateTile.type === TemplateTileType.SINGLE) {
        continue;
      }

      tileValue = calculateTileValue(layer, state.tileset, point.x, point.y, w, h, templateTileValue);
      commit('changeTile', {
        x: point.x,
        y: point.y,
        l: point.l,
        t: templateTileValue,
        v: tileValue,
      });
    }
  },

  pencil({ commit, dispatch, state }, tileDraw: TileDraw) {
    const w = state.map.w,
      h = state.map.h,
      surroundingTiles: Point[] = [];

    for (const drawData of tileDraw.data) {
      const layer = state.map.layer[tileDraw.l];
      const section = state.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      let tileValue;

      tileValue = calculateTileValue(layer, state.tileset, tileDraw.x, tileDraw.y, w, h, templateTileValue);
      commit('changeTile', {
        x: tileDraw.x,
        y: tileDraw.y,
        l: tileDraw.l,
        t: templateTileValue,
        v: tileValue,
      });

      visitSurroundingTiles(tileDraw.x, tileDraw.y, tileDraw.w, tileDraw.h, w, h, (px: number, py: number) => {
        surroundingTiles.push({
          x: px,
          y: py,
          l: tileDraw.l
        });

      });

      dispatch('correctAutotiles', surroundingTiles);
    }
  },

  fill({ commit, dispatch, state }, tileDraw: TileDraw) {
    const w = state.map.w,
      h = state.map.h;

    for (const drawData of tileDraw.data) {
      const layer = state.map.layer[tileDraw.l];
      const section = state.tileset.sections[drawData.s];
      const templateTile = section.templateTiles[drawData.t];
      const templateTileValue = packMapBuf(drawData.s, drawData.t);

      const doFill = (x: number, y: number, repTTV: number) => {
        const tileValue = calculateTileValue(layer, state.tileset, x, y, w, h, templateTileValue);
        const surroundingTiles: Point[] = [];
        commit('changeTile', {
          x,
          y,
          l: tileDraw.l,
          t: templateTileValue,
          v: tileValue,
        });

        if (x > 0 && layer.templateData[y * w + (x - 1)] === repTTV) {
          doFill(x - 1, y, repTTV);
        }

        if (y > 0 && layer.templateData[(y - 1) * w + x] === repTTV) {
          doFill(x, y - 1, repTTV);
        }

        if (x < w && layer.templateData[y * w + (x + 1)] === repTTV) {
          doFill(x + 1, y, repTTV);
        }

        if (y < h && layer.templateData[(y + 1) * w + x] === repTTV) {
          doFill(x, y + 1, repTTV);
        }

        visitSurroundingTiles(x, y, 1, 1, w, h, (px: number, py: number) => {
          surroundingTiles.push({
            x: px,
            y: py,
            l: tileDraw.l
          });
        });

        dispatch('correctAutotiles', surroundingTiles);

      };

      doFill(tileDraw.x, tileDraw.y, layer.templateData[tileDraw.y * w + tileDraw.x]);
    }
  },

  undo({ commit }) {
    commit('undo');
  },

  setTool({ commit }, toolId: number) {
    commit('setTool', toolId);
  }

};
