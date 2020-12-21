const input = await Deno.readTextFile("./input/twenty.in").then((res) =>
  res.split("\n\n")
);

/**
 * Helpers
 */

const head = ([head]) => head;

const partial = (f) => (g) => (a) => f(g(a));

const intersec = (a, b) => new Set([...a].filter((x) => b.has(x)));

const diff = (a, b) => new Set([...a].filter((x) => !b.has(x)));

// flips around the vertical and horizontal
// if two flips are composed, the other can be switched
// the result is the same
const flipTileV = (tile) => {
  return tile.reduce((prev, row) => {
    return [...prev, row.slice(0).reverse()];
  }, []);
};

const flipTileH = (tile) => {
  return tile.reduce((prev, row) => {
    return [row, ...prev];
  }, []);
};

// rotate rows into columns
const rotateTile = (tile) => {
  let acc = [];
  tile.forEach((row, rowIndex) => {
    return row.forEach((cell, colIndex) => {
      acc[colIndex] = acc[colIndex] || [];
      acc[colIndex][rowIndex] = cell;
    });
  }, []);

  return acc;
};

const doubleRotation = partial(rotateTile)(rotateTile);
const tripleRotation = partial(doubleRotation)(rotateTile);

// No rotation, single, double and triple -
// A fourth rotation would just return
// to the same initial state
const rotations = (tile) =>
  [(x) => x, rotateTile, doubleRotation, tripleRotation].map((fn) => fn(tile));

// Produces all transformations
// 2 flips around x(horizontal) or y axis(vertical)
// 4 rotations
// All possible transformation:
// 4 rotations(no flip) + 4 rotations(flip H) + 4 rotations(flip V) + 4 rotations(flipV flipH)
// That's 16 possible transformations for any n x n tile
// some of which might be repeated
const allXforms = (tile) =>
  [
    rotations,
    partial(rotations)(flipTileH),
    partial(rotations)(flipTileV),
    partial(partial(rotations)(flipTileH))(flipTileV)
  ]
    .map((fn) => fn(tile))
    .flat(1);

// Border getters
const leftBorder = (tile) => tile.map(([first]) => first).join("");
const rightBorder = (tile) => tile.map((row) => row.slice(-1)[0]).join("");
const topBorder = (tile) => head(tile).join("");
const bottomBorder = (tile) => head(tile.slice(-1)).join("");

// When comparing two borders, sometimes, one of them is fliped.
// This ensures that, every time a border is picked for comparisson,
// a representative version of the border is used. It turns the border
// to DEC and takes which ever border yields the higher value (the lowest works too)
const signBorder = (border) => {
  const weight = border
    .split("")
    .reduce(
      (prev, curr, index) => (curr === "#" ? prev + Math.pow(2, index) : prev),
      1
    );
  const revWeight = border
    .split("")
    .reverse()
    .reduce(
      (prev, curr, index) => (curr === "#" ? prev + Math.pow(2, index) : prev),
      1
    );

  return weight > revWeight ? border : border.split("").reverse().join("");
};

const allBorders = (tile) =>
  [leftBorder, rightBorder, bottomBorder, topBorder].map((fn) =>
    signBorder(fn(tile))
  );

/**
 * Part One
 */

const createTiles = (raw) =>
  new Map(
    raw.map((row) => {
      const [title, ...rawGrid] = row.split("\n");

      const id = Number(title.replace("Tile ", "").replace(":", ""));
      const grid = rawGrid.map((row) => row.split(""));

      return [id, grid];
    })
  );

const tiles = createTiles(input);
const tileIds = [...tiles.keys()];

const border2Tile = new Map();
const tile2Border = new Map();

for (const [id, grid] of tiles) {
  const borders = allBorders(grid);
  for (const border of borders) {
    const borderSet = border2Tile.get(border) ?? new Set();
    borderSet.add(id);
    border2Tile.set(border, borderSet);

    const idSet = tile2Border.get(id) ?? new Set();
    idSet.add(border);
    tile2Border.set(id, idSet);
  }
}

const countMap = new Map(
  tileIds.map((id) => {
    const matching = [...tile2Border.get(id)].filter(
      (curr) => border2Tile.get(curr).size === 1
    ).length;

    return [id, matching];
  })
);

const tilesWithCount = [...countMap.entries()];

const cornerTiles = tilesWithCount
  .filter(([, value]) => value === 2)
  .map(([id]) => id);

const edgeTiles = tilesWithCount
  .filter(([, value]) => value === 1)
  .map(([id]) => id);

console.log(
  "Verify Part One:",
  cornerTiles.reduce((prev, curr) => curr * prev, 1),
  83775126454273
);

/**
 * Part Two
 */

const corners = ["0.0", "11.0", "0.11", "11.11"];

// for all tiles, generate all 16 transformations
const allTransforms = new Map(
  [...tiles.entries()].map(([id, grid]) => [id, allXforms(grid)])
);

function backTrack(
  y,
  x,
  setTiles,
  image = Array.from({ length: 12 }, () => Array.from({ length: 12 }, () => []))
) {
  // if the last row (11) was completed
  if (y === 12) return image;

  // advance in the row
  let ny = y;
  let nx = x + 1;

  // ended this row, advance to "next line"
  if (nx === 12) {
    nx = 0;
    ny = y + 1;
  }

  let candidates = setTiles;

  if (corners.includes(`${x}.${y}`)) {
    // corners
    candidates = intersec(setTiles, new Set(cornerTiles));
  } else if ([x, y].some((c) => [0, 11].includes(c))) {
    // edges
    candidates = intersec(setTiles, new Set(edgeTiles));
  }

  for (const id of candidates) {
    const tileRotations = allTransforms.get(id);
    for (const rotation of tileRotations) {
      const above = image?.[y - 1]?.[x] ?? null;
      // inside the grid (non edges), the top border of the current
      // rotation, should line up with the bottom border of the tile above
      if (above && topBorder(rotation) !== bottomBorder(above)) {
        continue;
      }
      const behind = image?.[y]?.[x - 1] ?? null;
      // inside the grid (non edges), the left border of the current
      // rotation, should line up with the right border of the tile before
      if (behind && leftBorder(rotation) !== rightBorder(behind)) {
        continue;
      }

      image[y][x] = rotation;

      const next = diff(setTiles, new Set([id]));
      if (backTrack(ny, nx, next, image)) return image;

      // else let the loop roll
      // if nothing is found this branch returns null
      // and it stops
    }
  }
  return null;
}

const image = backTrack(0, 0, new Set([...tileIds]));

/**
 *
 * Even more helpers
 *
 */
const printTileRow = (tileRow) => {
  const height = tileRow[0].length;

  return Array.from({ length: height }, (_, i) =>
    tileRow.map((tile) => tile[i].join("")).join("")
  ).join("\n");
};

const printImage = (grid) =>
  grid.reduce((prev, tileRow) => {
    return prev
      ? `${prev}\n${printTileRow(tileRow)}`
      : `${printTileRow(tileRow)}`;
  }, "");

const img2grid = (img) => img.split("\n").map((row) => row.split(""));
const grid2img = (grid) => grid.map((row) => row.join("")).join("\n");

const withOutBorder = (grid) => {
  return grid.reduce((prev, row, index, src) => {
    if (index === 0 || index === src.length - 1) return prev;
    return [...prev, row.slice(1, row.length - 1)];
  }, []);
};

const monster = `
                    # 
  #    ##    ##    ###
   #  #  #  #  #  #   
`;

const monsterGrid = monster.split("\n").filter((x) => x); // very IMPORTANT to filter

// find tail start coords
const [yRef, xRef] = head(
  monsterGrid
    .map((row, y) => row.split("").map((cell, x) => [y, x, cell]))
    .flat(1)
    .filter(([, , cell]) => cell === "#")
    .sort((a, b) => a[1] - b[1])
);

// relative to the tail start, can we built a monster?
const isTail = (x, y, grid) =>
  monsterGrid
    .map((row, y) => row.split("").map((cell, x) => [y - yRef, x - xRef, cell]))
    .flat(1)
    .filter(([, , cell]) => cell === "#")
    .every(([dy, dx]) => grid?.[y + dy]?.[x + dx] === "#");

const findTail = (grid) =>
  grid.reduce(
    (prev, row, y, src) => [
      ...prev,
      ...row.map((cell, x) => {
        return { x, y, tail: cell === "#" ? isTail(x, y, src) : false, cell };
      })
    ],
    []
  );

const restOfMonster = (x, y) =>
  monsterGrid
    .map((row, y) => row.split("").map((cell, x) => [y - yRef, x - xRef, cell]))
    .flat(1)
    .filter(([, , cell]) => cell === "#")
    .map(([dy, dx]) => [y + dy, x + dx]);

const borderless = image.map((tileRow) => tileRow.map(withOutBorder));

const wholeImage = printImage(borderless);

const allImageXforms = allXforms(img2grid(wholeImage));

// search for tails through all unique transformations
const [coords] = [...new Set(allImageXforms.map(grid2img))]
  .map(img2grid)
  .map(findTail)
  .filter((grid) => grid.some(({ tail }) => tail));

// print the monster tail's
const satellite = coords
  .reduce((prev, { x, y, cell, tail }) => {
    prev[y] = prev?.[y] ?? [];
    let current = prev[y][x];

    if (current !== "O") {
      prev[y][x] = tail ? "O" : cell;
    }

    if (tail) {
      restOfMonster(x, y).forEach(([_y, _x]) => {
        prev[_y] = prev?.[_y] ?? [];
        prev[_y][_x] = "O";
      });
    }

    return prev;
  }, [])
  .map((row) => row.join(""))
  .join("\n");

console.log(satellite.replaceAll("#", "~").replaceAll(".", " "));

const tails = coords.filter(({ tail }) => tail);

const totalTails = tails.length;
const seaWaves = wholeImage.match(/#/g).length;
const roughness = seaWaves - totalTails * monster.match(/#/g).length;

console.log("Part Two:", roughness);
