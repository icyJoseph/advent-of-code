extern crate two;
use std::fs;
use two::{consume_entry, part_one, part_two};

fn main() {
    let raw_input = fs::read_to_string("./input/two.in").expect("Error reading input");
    let input = raw_input.split_terminator("\n").map(consume_entry).collect();
    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
