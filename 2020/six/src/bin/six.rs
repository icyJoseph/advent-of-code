extern crate six;
use six::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/six.in").expect("Error reading input");
    let groups = raw_input
        .split_terminator("\n")
        .map(|x| x.to_string())
        .collect::<Vec<String>>();

    println!("Part One: {}", part_one(&groups));
    println!("Part Two: {}", part_two(&groups));
}
