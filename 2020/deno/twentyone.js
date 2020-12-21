const input = await Deno.readTextFile("./input/twentyone.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const intersec = (a, b) => new Set([...a].filter((x) => b.has(x)));

const diff = (a, b) => new Set([...a].filter((x) => !b.has(x)));

const join = (a, b) => new Set([...a, ...b]);

/**
 * Part One
 */

const foodDict = new Map();
const ingredientDict = new Map();
const allergenDict = new Map();

input.forEach((row) => {
  const [ingrs, algs] = row.replace(")", "").split(" (contains ");

  const allAllergens = algs.split(", ");
  const ingredients = ingrs.split(" ");

  foodDict.set(ingrs, new Set(allAllergens));

  for (const entry of ingredients) {
    const set = ingredientDict.get(entry) ?? new Set();
    ingredientDict.set(entry, new Set([...set, ...allAllergens]));
  }

  for (const entry of allAllergens) {
    const arr = allergenDict.get(entry) ?? [];
    arr.push(new Set(ingredients));
    allergenDict.set(entry, arr);
  }
});

// POEM: there was a time when I was there, but you were not

const allPossibleIngredients = [...allergenDict.values()].reduce(
  (prev, sets) => {
    const possible = sets.reduce(intersec);
    return join(prev, possible);
  },
  new Set()
);

const allIngredients = new Set([...ingredientDict.keys()]);

const safeIngredients = diff(allIngredients, allPossibleIngredients);

const foodList = [...foodDict.keys()];

const count = [...safeIngredients.values()].reduce((prev, curr) => {
  return (
    foodList.filter((entry) => entry.split(" ").includes(curr)).length + prev
  );
}, 0);

console.log("Part One:", count);

/**
 * Part Two
 */

const withAllergen = [...allergenDict.entries()].reduce(
  (prev, [allergen, sets]) => {
    const possible = sets.reduce(intersec);
    return [...prev, { allergen, possible }];
  },
  []
);

const exhaust = (list) => {
  if (list.every(({ possible }) => possible.size === 1)) {
    return list;
  }
  const resolved = list.filter(({ possible }) => possible.size === 1);
  const unresolved = list.filter(({ possible }) => possible.size > 1);

  const aggregate = resolved.reduce(
    (prev, { possible }) => join(prev, possible),
    new Set()
  );
  return exhaust([
    ...resolved,
    ...unresolved.map(({ allergen, possible }) => {
      return { allergen, possible: diff(possible, aggregate) };
    })
  ]);
};

const allergenIngredients = exhaust(withAllergen);

const sortedAllergens = [...allergenDict.keys()].sort();
const dangerousList = sortedAllergens
  .map((allergen) =>
    allergenIngredients.find((entry) => entry.allergen === allergen)
  )
  .map(({ possible }) => [...possible])
  .join(",");

console.log("Part Two:", dangerousList);
