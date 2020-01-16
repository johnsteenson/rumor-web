import { Tileset, TilesetSection, TileType, TileAnim } from '@/types/tileset';

/*

TODO - This can potentially be deleted

export function mapSection(inSection: TilesetSection) {
  const tileSection: TilesetSection = {
    imageFile: inSection.imageFile,
    tilesPerRow: inSection.tilesPerRow,
    totalRows: inSection.totalRows,
    tiles: new Array(1000 + inSection.tiles.length)
  };

  tileSection.tiles[0] = {
    type: TileType.SINGLE,
    tile: []
  }

  for (let i=0; i < inSection.tilesPerRow * inSection.totalRows; i++) {
    tileSection.tiles[i + 1] = {
      type: TileType.SINGLE,
      tile: [i]
    }
  }

  for (let i=0; i < inSection.tiles.length; i++) {
    const inTile = inSection.tiles[i];
    tileSection.tiles[1000 + i] = {
      type: inSection.tiles[i].type,
      tile: Array.from(inSection.tiles[i].tile,
        (v: TileAnim) => {
          if (Array.isArray(v)) {
            return Array.from(v);
          }

          return v;
        })
    }
  }

  return tileSection;
}

export function mapTileset(inTileset: Tileset) {
  const tileset: Tileset = {
    name: inTileset.name,
    tileSize: {
      w: inTileset.tileSize.w,
      h: inTileset.tileSize.h
    },
    sections: []
  }

  for(let inSection of inTileset.sections) {
    tileset.sections.push( mapSection(inSection) )
  }

  return tileset;
}
*/
