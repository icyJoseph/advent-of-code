const input = await Deno.readTextFile("./input/twentyone.in").then((res) =>
  res.split("\n")
);

/**
 * Helpers
 */

const intersec = <T extends string | string[]>(a: Set<T>, b: Set<T>) =>
  new Set([...a].filter((x) => b.has(x)));

const diff = <T extends string | string[]>(a: Set<T>, b: Set<T>) =>
  new Set([...a].filter((x) => !b.has(x)));

const join = <T extends string | string[]>(a: Set<T>, b: Set<T>) =>
  new Set([...a, ...b]);

/**
 * Part One
 */

const foodDict = new Map<string, Set<string>>();
const ingredientDict = new Map<string, Set<string>>();
const allergenDict = new Map<string, Set<string>[]>();

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
  (prev: Set<string>, sets: Set<string>[]) => {
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

type Possibility = {
  allergen: string;
  possible: Set<string>;
};

const withAllergen = [...allergenDict.entries()].reduce<Possibility[]>(
  (prev, [allergen, sets]: [allergen: string, sets: Set<string>[]]) => {
    const possible = sets.reduce(intersec);
    return [...prev, { allergen, possible }];
  },
  []
);

const exhaust = (list: Possibility[]): Possibility[] => {
  if (list.every(({ possible }) => possible.size === 1)) {
    return list;
  }
  const resolved = list.filter(({ possible }) => possible.size === 1);
  const unresolved = list.filter(({ possible }) => possible.size > 1);

  const aggregate = resolved.reduce<Set<string>>(
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
    allergenIngredients.find(
      (entry: Possibility) => entry.allergen === allergen
    )
  )
  .filter((x: Possibility | undefined): x is Possibility => !!x)
  .map(({ possible }) => [...possible])
  .join(",");

console.log("Part Two:", dangerousList);
