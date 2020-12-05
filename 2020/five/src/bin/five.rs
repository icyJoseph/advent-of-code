extern crate five;
use five::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/five.in").expect("Error reading input");
    let boarding_passes = raw_input
        .split_terminator("\n")
        .map(|x| x.to_string())
        .collect();
    println!("Part One: {}", part_one(&boarding_passes));
    println!("Part Two: {}", part_two(&boarding_passes));
}
