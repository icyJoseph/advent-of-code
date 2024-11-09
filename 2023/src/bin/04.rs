use std::collections::{HashMap, HashSet};

#[aoc2023::main(04)]
fn main(input: &str) -> (usize, usize) {
    let mut part_one = 0;
    let mut part_two = 0;

    let mut counter = HashMap::<usize, usize>::new();

    for (y, line) in input.lines().enumerate() {
        let current = *counter.entry(y).or_insert(1);

        part_two += current;

        let Some(spec) = line.split(": ").nth(1) else {
            panic!("bad spec");
        };

        let mut numbers = spec.split(" | ");

        let Some(winning) = numbers.next() else {
            panic!("missing winning");
        };
        let Some(result) = numbers.next() else {
            panic!("missing result");
        };

        let winning = winning
            .split(' ')
            .filter_map(|n| n.trim().parse::<u32>().ok())
            .collect::<HashSet<u32>>();

        let result = result
            .split(' ')
            .filter_map(|n| n.trim().parse::<u32>().ok());

        let mut matches = 0;

        for number in result {
            if winning.contains(&number) {
                matches += 1;
            }
        }

        for index in y + 1..=(y + matches) {
            counter
                .entry(index)
                .and_modify(|c| *c += current)
                .or_insert(1 + current);
        }

        part_one += if matches == 0 { 0 } else { 1 << (matches - 1) };
    }

    (part_one, part_two)
}
