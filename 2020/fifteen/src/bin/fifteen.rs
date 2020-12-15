extern crate fifteen;
use fifteen::memory_game;
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/fifteen.in").expect("Error reading input");
    let input = raw_input
        .split_terminator(",")
        .map(|num| num.parse::<u32>().unwrap())
        .collect();

    println!("Part One: {}", memory_game(&input, 2020));
    println!("Part Two: {}", memory_game(&input, 30000000));
}
