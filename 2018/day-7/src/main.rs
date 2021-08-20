use aoc;

fn solve(raw: String) -> () {
    let input = raw.trim();

    let instructions = input
        .split("\n")
        .map(|s| {
            s.to_string()
                .replace("Step ", "")
                .replace("must be finished before step ", "")
                .replace(" can begin.", "")
        })
        .collect::<Vec<String>>();

    let molecules = instructions
        .iter()
        .map(|s| {
            s.split(" ")
                .flat_map(|x| x.to_string().chars().collect::<Vec<char>>())
                .collect::<Vec<char>>()
        })
        .collect::<Vec<Vec<char>>>();

    let mut all_atoms = molecules
        .iter()
        .flat_map(|x| x)
        .map(|&x| x)
        .collect::<Vec<char>>();

    all_atoms.sort();
    all_atoms.dedup();

    use std::collections::HashMap;

    let mut table: HashMap<char, Vec<char>> = HashMap::new();
    let mut rev_table: HashMap<char, Vec<char>> = HashMap::new();

    for mol in &molecules {
        table.entry(mol[0]).or_insert(vec![]).push(mol[1]);
        rev_table.entry(mol[1]).or_insert(vec![]).push(mol[0]);
    }

    let mut in_order = all_atoms
        .iter()
        .filter(|x| match rev_table.get(x) {
            Some(_) => false,
            None => true,
        })
        .flat_map(|x| x.to_string().chars().collect::<Vec<char>>())
        .collect::<Vec<char>>();

    let mut q = vec![];

    let mut i = 0;
    loop {
        let current = in_order[i];

        match table.get(&current) {
            Some(enq) => {
                let cp = enq.to_vec();

                for c in cp {
                    if !q.contains(&c) {
                        q.push(c);
                    }
                }
            }
            None => {}
        }

        if q.len() == 0 {
            break;
        }

        let mut candidates = q
            .iter()
            .filter(|v| {
                rev_table
                    .get(v)
                    .unwrap()
                    .iter()
                    .all(|s| in_order.contains(s))
            })
            .map(|&c| c)
            .collect::<Vec<char>>();

        let next = if candidates.len() == 1 {
            candidates[0]
        } else {
            candidates.sort();
            candidates[0]
        };

        let index = q.iter().position(|&c| c == next).unwrap();

        q.remove(index);

        in_order.push(next);

        i += 1;
    }

    println!("Part 1: {}", in_order.iter().collect::<String>());
}

fn main() {
    let input = aoc::get_input(2018, 7);
    solve(input);
}
