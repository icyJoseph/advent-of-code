extern crate nine;
use nine::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/nine.in").expect("Error reading input");
    let input = raw_input
        .split_terminator("\n")
        .map(|star| star.parse::<i64>().unwrap())
        .collect();

    let weakness = part_one(&input);
    println!("Part One: {}", weakness);
    println!("Part Two: {}", part_two(&input, weakness));
}
