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

    let mut workers: Vec<Option<(u32, char)>> = vec![None; 5];

    let mut done = all_atoms
        .iter()
        .filter(|x| match rev_table.get(x) {
            Some(_) => false,
            None => true,
        })
        .flat_map(|x| x.to_string().chars().collect::<Vec<char>>())
        .collect::<Vec<char>>();

    let mut tick = 0;
    let mut m_q = vec![];

    match done.pop() {
        Some(v) => m_q.push(v),
        None => panic!("No starting step found"),
    }

    loop {
        println!("\n===============");
        println!("tick: {}", tick);
        println!("Done: {:?}", done);
        println!("Workers: {:?}", workers);
        println!("Queue: {:?}", m_q);

        if m_q.len() == 0 && workers.iter().all(|x| x.is_none()) {
            println!("===============\n\n");
            break;
        }

        // walk the workers
        // assigning from the queue
        for i in 0..workers.len() {
            match workers[i] {
                Some(_) => continue,
                None => {
                    // from the maybe queue
                    // take those which requirements
                    // are all done
                    let mut candidates = m_q
                        .iter()
                        .filter(|x| match rev_table.get(x) {
                            Some(v) => v.iter().all(|req| done.contains(req)),
                            // only for the starting step
                            None => true,
                        })
                        .map(|&x| x)
                        .collect::<Vec<char>>();

                    // nothing to do
                    if candidates.len() == 0 {
                        continue;
                    }

                    // worker is free
                    // if there's one candidate, take it
                    let next = if candidates.len() == 1 {
                        candidates[0]
                    } else {
                        candidates.sort();

                        candidates[0]
                    };

                    let index = m_q.iter().position(|&c| c == next).unwrap();

                    m_q.remove(index);

                    let delta = next as u32 - 4;

                    workers[i] = Some((tick + delta - 1, next));
                }
            }
        }

        // try to release workers
        // after assigning to others
        // this will make new steps available
        // on the next tick
        for i in 0..workers.len() {
            match workers[i] {
                Some((delta, c)) => {
                    if delta <= tick {
                        workers[i] = None;

                        done.push(c);

                        match table.get(&c) {
                            Some(xs) => {
                                for x in xs {
                                    if !m_q.contains(x) {
                                        m_q.push(*x);
                                    }
                                }
                            }
                            None => continue,
                        }
                    }
                }
                None => continue,
            }
        }

        tick += 1;

        println!("===============\n");
    }

    println!("Part 2: {:?}", tick);
}

fn main() {
    let input = aoc::get_input(2018, 7);
    solve(input);
}
