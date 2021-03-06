const fs = require("fs");
const path = require("path");

const makeLeaf = node => {
  return {
    node,
    orbiters: [],
    set add(node) {
      this.orbiters.push(node);
    }
  };
};

const aggregateOrbiters = (src, { node, orbiters }) => {
  let all = [];
  orbiters.forEach(curr => {
    const leaf = src.find(entry => entry.node === curr);
    all.push(...leaf.orbiters);
    all.push(...aggregateOrbiters(src, leaf));
  });
  return all;
};

function findParentHood(tree, node) {
  let current = node;
  let acc = [];

  while (1) {
    const parent = tree.find(({ orbiters }) => orbiters.includes(current));
    if (!parent) {
      break;
    }
    current = parent.node;
    acc.push(parent.node);
  }
  return acc;
}

fs.readFile(
  path.resolve(__dirname, "../", "input/day_six.in"),
  "utf-8",
  (err, data) => {
    if (err) return console.log(err);

    const nodes = data.split("\n").map(orbit => orbit.split(")"));

    const uniqueNodes = [...new Set(nodes.flat())];

    let tree = [];

    uniqueNodes.forEach(node => {
      const orbits = nodes.filter(([first]) => first === node);

      const leaf = makeLeaf(node);

      orbits.forEach(([, orbiter]) => (leaf.add = orbiter));
      tree.push(leaf);
    });

    const total = tree
      .reduce((prev, curr) => {
        const indirect = aggregateOrbiters(tree, curr);
        return prev.concat({
          ...curr,
          orbiters: curr.orbiters.concat(indirect)
        });
      }, [])
      .reduce((prev, { orbiters }) => orbiters.length + prev, 0);

    console.log(total);

    const branch = findParentHood(tree, "YOU");
    const sanBranch = findParentHood(tree, "SAN");

    const [cross] = branch.filter(entry => sanBranch.indexOf(entry) >= 0);

    console.log(branch.indexOf(cross) + sanBranch.indexOf(cross));
  }
);
