extern crate four;
use four::{collect_password, parse, part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/four.in").expect("Error reading input");
    let seed = Vec::new();
    let input: Vec<Vec<(String, String)>> = raw_input
        .split_terminator("\n")
        .fold(seed, |prev, curr| parse(prev, curr))
        .into_iter()
        .map(|entry| collect_password(entry))
        .collect();

    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
