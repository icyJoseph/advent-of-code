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

const tiles = createTiles(input);
const withMatching = matchTiles(tiles);

const corners = withMatching.filter(
  ({ candidates }) => candidates.length === 2
);

console.log(
  "Part One:",
  corners.map(({ id }) => id).reduce((prev, curr) => prev * curr, 1)
);
