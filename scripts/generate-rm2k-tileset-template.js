
const fs = require('fs');

const W = 480;
const H = 256;
const IMAGE_TILES_PER_ROW = 30;

const tileset = {
  name: "World",
  tileSize: {
    w: 16,
    h: 16
  },

  sections: []
}

function createSection(tileset) {
  const section = {
    imageFile: "world.png",
    tilesPerRow: 6,
    totalRows: 16,
    tiles: []
  };

  tileset.sections.push(section);
  return section;
}

function t(x, y) {
  return y * IMAGE_TILES_PER_ROW + x
}

function tblock(x, y, w, h) {
  const tiles = [],
    xEnd = x + w,
    yEnd = y + h;

  for(let j = y; j < yEnd; j++) {
    for(let i = x; i < xEnd; i++) {
      tiles.push(j * IMAGE_TILES_PER_ROW + i);
    }
  }

  return tiles;
}

function generateWater(section, startX, startY) {
  const tiles = section.tiles;

  tiles.push({
    type: 0,
    tile: [t(startX, startY)]
  })
}

function generateBlock(section, startX, startY) {
  const tiles = section.tiles;

  tiles.push({
    type: 1,
    tile: tblock(startX, startY, 3, 4)
  })
}

function generateSingleAnim(section, startX, startY) {
  const tiles = section.tiles;

  tiles.push({
    type: 2,
    tile: [tblock(startX, startY, 1, 4)]
  })
}

function generateSingle(section, x, y) {
  const tiles = section.tiles;

  tiles.push({
    type: 0,
    tile: [t(x, y)]
  })
}

function doGenerate(tileset) {
  const sectionA = createSection(tileset),
    sectionB = createSection(tileset);

  generateWater(sectionA, 0, 0);
  generateWater(sectionA, 3, 0);

  generateBlock(sectionA, 6, 0);
  generateBlock(sectionA, 9, 0);

  generateBlock(sectionA, 6, 4);
  generateBlock(sectionA, 9, 4);

  generateBlock(sectionA, 0, 8);
  generateBlock(sectionA, 3, 8);
  generateBlock(sectionA, 6, 8);
  generateBlock(sectionA, 9, 8);

  generateBlock(sectionA, 0, 12);
  generateBlock(sectionA, 3, 12);
  generateBlock(sectionA, 6, 12);
  generateBlock(sectionA, 9, 12);

  generateSingleAnim(sectionA, 3, 4);
  generateSingleAnim(sectionA, 4, 4);
  generateSingleAnim(sectionA, 5, 4);

  for (let j = 0; j < 16; j++) {
    for (let i = 12; i < 18; i++) {
      generateSingle(sectionA, i, j)
    }
  }

  for (let j = 0; j < 8; j++) {
    for (let i = 18; i < 24; i++) {
      generateSingle(sectionA, i, j)
    }
  }

  for (let j = 8; j < 16; j++) {
    for (let i = 18; i < 24; i++) {
      generateSingle(sectionB, i, j)
    }
  }

  for (let j = 0; j < 16; j++) {
    for (let i = 24; i < 30; i++) {
      generateSingle(sectionB, i, j)
    }
  }

  return JSON.stringify(tileset, null, 2);
}


const output = doGenerate(tileset);

fs.writeFile('../src/data/tileset-world.json', output, (error) => {
  if (error)
    throw error;

  console.log('Written tileset-world.json');
})
