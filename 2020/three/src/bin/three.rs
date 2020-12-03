extern crate three;
use std::fs;
use three::{part_one, part_two};

fn main() {
    let raw_input = fs::read_to_string("./input/three.in").expect("Error reading input");
    let input: Vec<String> = raw_input
        .split_terminator("\n")
        .map(|row| row.to_string())
        .collect();

    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
