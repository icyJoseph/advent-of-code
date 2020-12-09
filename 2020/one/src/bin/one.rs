extern crate one;
use one::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/one.in").expect("Error reading input");
    let input = raw_input
        .split_terminator("\n")
        .map(|star| star.parse::<i64>().unwrap())
        .collect();
    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
