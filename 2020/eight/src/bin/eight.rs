extern crate eight;
use eight::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/eight.in").expect("Error reading input");
    let input = raw_input
        .split_terminator("\n")
        .map(|x| x.to_string())
        .collect();
    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
