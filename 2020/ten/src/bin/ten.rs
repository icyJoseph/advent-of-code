extern crate ten;
use std::fs;
use ten::{part_one, part_two};

fn main() {
    let raw_input = fs::read_to_string("./input/ten.in").expect("Error reading input");
    let mut input: Vec<i64> = raw_input
        .split_terminator("\n")
        .map(|adapter| adapter.parse::<i64>().unwrap())
        .collect();

    input.sort();

    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
