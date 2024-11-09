use std::collections::HashMap;

#[derive(Debug)]
struct Counter {
    current: usize,
}

impl Counter {
    fn new() -> Self {
        Counter { current: 0 }
    }

    fn inc(&mut self) {
        self.current += 1;
    }

    fn inc_by(&mut self, qty: usize) {
        self.current += qty;
    }

    fn get_value(&self) -> usize {
        self.current
    }
}

#[aoc2023::main(12)]
fn main(input: &str) -> (usize, usize) {
    let mut part_one = 0;

    for line in input.lines() {
        let mut spec = line.split(' ');

        let Some(springs) = spec.next() else {
            panic!("Can't read map");
        };

        let Some(config) = spec.next() else {
            panic!("No config");
        };

        let config = config
            .split(',')
            .filter_map(|x| x.parse::<usize>().ok())
            .collect::<Vec<_>>();

        let mut seen: HashMap<String, usize> = HashMap::new();

        let mut local = Counter::new();

        let springs = springs.chars().collect::<Vec<char>>();

        search(&springs, &config, &mut local, &mut seen);

        part_one += local.get_value();
    }

    let mut part_two = 0;

    for line in input.lines() {
        let mut spec = line.split(' ');

        let Some(springs) = spec.next() else {
            panic!("Can't read map");
        };

        let Some(config) = spec.next() else {
            panic!("No config");
        };

        let config = config
            .split(',')
            .filter_map(|x| x.parse::<usize>().ok())
            .collect::<Vec<_>>();

        let mut seen: HashMap<String, usize> = HashMap::new();

        let mut local = Counter::new();

        let springs = [springs, springs, springs, springs, springs].join("?");
        let springs = springs.chars().collect::<Vec<char>>();

        let config = config.repeat(5);

        search(&springs, &config, &mut local, &mut seen);

        part_two += local.get_value();
    }

    (part_one, part_two)
}

fn search(
    springs: &[char],
    config: &[usize],
    carry: &mut Counter,
    seen: &mut HashMap<String, usize>,
) {
    let springs_key: String = springs.iter().collect::<String>();
    let configs_key: String = config
        .iter()
        .map(|n| n.to_string())
        .collect::<Vec<String>>()
        .join(",");

    let current_key = format!("{springs_key}::{configs_key}");

    if seen.contains_key(&current_key) {
        let Some(result) = seen.get(&current_key) else {
            panic!("Rust problem not mine");
        };

        carry.inc_by(*result);

        return;
    }

    let space_needed = if config.is_empty() {
        0
    } else {
        config.iter().sum::<usize>() + config.len() - 1
    };

    let space_available = springs.len();

    if space_available < space_needed {
        return;
    }

    if space_needed == 0 && space_available == 0 {
        carry.inc();
        return;
    }

    if space_needed == 0 {
        if springs.iter().all(|&c| c != '#') {
            carry.inc();
        }

        return;
    }

    let mut local = Counter::new();

    match springs[0] {
        '.' => {
            search(&springs[1..], config, &mut local, seen);

            seen.insert(current_key, local.get_value());
        }
        '#' => {
            let long_block = springs[..config[0]]
                .iter()
                .collect::<String>()
                .replace('?', "#");

            let mut should_search = true;

            if long_block != "#".repeat(config[0]) {
                should_search = false;
            }

            if let Some(&v) = springs.get(config[0]) {
                if v == '#' {
                    should_search = false;
                }
            }

            if should_search {
                let from = config[0] + 1;

                let next = if springs.len() < from {
                    vec![]
                } else {
                    springs[from..].to_vec()
                };

                search(&next, &config[1..], &mut local, seen);
            }
        }
        '?' => {
            let mut next = springs.to_vec();
            next[0] = '#';

            search(&next, config, &mut local, seen);

            next[0] = '.';
            search(&next, config, &mut local, seen);
        }

        _ => {
            panic!("Unexpected character")
        }
    }

    carry.inc_by(local.get_value());
}
