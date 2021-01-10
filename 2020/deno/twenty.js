const input = await Deno.readTextFile("./input/twenty.in").then((res) =>
  res.split("\n\n")
);

/**
 * Helpers
 */

// flips around the vertical
const flipGrid = (grid) => {
  return grid.reduce((prev, row) => {
    return [...prev, row.slice(0).reverse()];
  }, []);
};

// rows into columns
const rotateGrid = (grid) => {
  let acc = [];
  grid.forEach((row, rowIndex) => {
    return row.forEach((cell, colIndex) => {
      acc[colIndex] = acc[colIndex] || [];
      acc[colIndex][rowIndex] = cell;
    });
  }, []);

  return acc;
};

const getBorders = ({ grid, id }) => {
  const [top] = grid;
  const [bottom] = grid.slice(-1);
  const left = grid.map(([first]) => first).join("");
  const right = grid.map((row) => row.slice(-1)[0]).join("");
  return [
    { id, pos: "top", value: top.join("") },
    { id, pos: "left", value: left },
    { id, pos: "bottom", value: bottom.join("") },
    { id, pos: "right", value: right }
  ];
};

const print = (grid) => {
  return grid.reduce((prev, row) => {
    return `${prev}\n${row.join("")}`;
  }, "");
};

const createTiles = (raw) =>
  raw.map((row) => {
    const [title, ...rawGrid] = row.split("\n");
    const id = Number(title.replace("Tile ", "").replace(":", ""));
    const grid = rawGrid.map((row) => row.split(""));
    return { id, grid };
  });

const matchTiles = (tiles) => {
  return tiles.map(({ id, grid }) => {
    const borders = getBorders({ grid, id });
    const others = tiles.filter((tile) => tile.id !== id);

    return {
      id,
      candidates: others
        .map((tile) => {
          const otherBorders = getBorders(tile);

          return borders
            .map((border) => ({
              ...border,
              matches: otherBorders.find(
                (entry) =>
                  entry.value === border.value ||
                  entry.value.split("").reverse().join("") === border.value
              )
            }))
            .filter(({ matches }) => matches)
            .map(({ matches, ...rest }) => ({
              ...rest,
              matches,
              matchId: matches.id,
              rotate: matches.value !== rest.value
            }));
        })
        .flat(1)
    };
  });
};

/**
 * Part One
 */

const naiveTiles = createTiles(input);
const withMatching = matchTiles(naiveTiles);

console.log(
  "Part One:",
  withMatching
    .filter(({ candidates }) => candidates.length === 2)
    .map(({ id }) => id)
    .reduce((prev, curr) => prev * curr)
);

/**
 * Helpers
 */

const head = ([head]) => head;

const rev = (str) => str.split("").reverse().join("");

const compose = (...fns) => (a) => fns.reduceRight((arg, fn) => fn(arg), a);

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
/**
 * Wrong Implementation, which somehow solves the problem!
 * It also adds about 4 seconds over head
 */
// const rotateTile = (tile) => {
//   let acc = [];
//   tile.forEach((row, rowIndex) => {
//     return row.forEach((cell, colIndex) => {
//       acc[colIndex] = acc[colIndex] || [];
//       acc[colIndex][rowIndex] = cell;
//     });
//   }, []);

//   return acc;
// };

export const rotateTile = (tile) => {
  return tile.reduce((acc, row, x) => {
    return row.reduce((prev, cell, colIndex, src) => {
      const y = src.length - 1 - colIndex;
      prev[y] = prev[y] || [];
      prev[y][x] = cell;
      return prev;
    }, acc);
  }, []);
};

const doubleRotation = compose(rotateTile, rotateTile);
const tripleRotation = compose(rotateTile, rotateTile, rotateTile);

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
    compose(rotations, flipTileH),
    compose(rotations, flipTileV),
    compose(rotations, flipTileH, flipTileV)
  ]
    .map((fn) => fn(tile))
    .flat(1);

// Border getters
const leftBorder = (tile) => tile.map(([first]) => first).join("");
const rightBorder = (tile) => tile.map((row) => row.slice(-1)[0]).join("");
const topBorder = (tile) => head(tile).join("");
const bottomBorder = (tile) => head(tile.slice(-1)).join("");

const border2bin = (border) => border.replaceAll("#", "1").replaceAll(".", "0");

// When comparing two borders, sometimes, one of them is fliped.
// This ensures that, every time a border is picked for comparisson,
// a representative version of the border is used. It turns the border
// to DEC and takes which ever border yields the higher value (the lowest works too)
const signBorder = (border) => {
  const bin = border2bin(border);

  return Math.max(bin, rev(bin));
};

const allBorders = (tile) =>
  [leftBorder, rightBorder, bottomBorder, topBorder].map((fn) =>
    signBorder(fn(tile))
  );

/**
 * Part One
 */

const createTilesMap = (raw) =>
  new Map(
    raw.map((row) => {
      const [title, ...rawGrid] = row.split("\n");

      const id = Number(title.replace("Tile ", "").replace(":", ""));
      const grid = rawGrid.map((row) => row.split(""));

      return [id, grid];
    })
  );

const tiles = createTilesMap(input);
const tileIds = [...tiles.keys()];

const allTilesBorders = new Map(
  Object.entries(
    Object.entries(
      tileIds.reduce((prev, id) => {
        return {
          ...prev,
          ...allBorders(tiles.get(id)).reduce((acc, border) => {
            return { ...acc, [border]: [...(prev[border] ?? []), id] };
          }, {})
        };
      }, {})
    )
      .filter(([_, grids]) => grids.length > 1)
      .reduce((prev, [_, grids]) => {
        return {
          ...prev,
          ...grids.reduce(
            (acc, id) => ({ ...acc, [id]: (prev[id] ?? 0) + 1 }),
            {}
          )
        };
      }, {})
  )
);

const cornerTiles = [...allTilesBorders.keys()]
  .filter((id) => {
    return allTilesBorders.get(id) === 2;
  })
  .map(Number);

const edgeTiles = [...allTilesBorders.keys()]
  .filter((id) => allTilesBorders.get(id) === 3)
  .map(Number);

console.log(
  "Verify Part One:",
  cornerTiles.reduce((prev, curr) => curr * prev)
);

/**
 * Part Two
 */

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

  if (["0.0", "11.0", "0.11", "11.11"].includes(`${x}.${y}`)) {
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

const pieces = {
  0: " ",
  1: "_",
  2: "_",
  3: "_",
  4: "_",
  5: "_",
  6: "O",
  7: ">",
  8: ".",
  9: "\\",
  10: "/",
  11: "\\",
  12: "/",
  13: "\\",
  14: "/"
};

const monsterGrid = monster.split("\n").filter((x) => x); // very IMPORTANT to filter

// find tail start coords
const [yRef, xRef] = head(
  monsterGrid
    .map((row, y) => row.split("").map((cell, x) => [y, x, cell]))
    .flat(1)
    .filter(([, , cell]) => cell === "#")
    .sort((a, b) => a[1] - b[1])
);

// relative to the tail start, can we build a monster?
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
    let current = prev[y][x] ?? " ";

    if (current === " " || current === "#") {
      prev[y][x] = tail ? "-" : cell;
    }

    if (tail) {
      restOfMonster(x, y).forEach(([_y, _x], index) => {
        prev[_y] = prev?.[_y] ?? [];
        prev[_y][_x] = pieces[index];
        // prev[_y][_x] = "O";
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
