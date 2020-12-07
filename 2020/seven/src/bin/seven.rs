extern crate seven;
use seven::{part_one, part_two};
use std::fs;

fn main() {
    let raw_input = fs::read_to_string("./input/seven.in").expect("Error reading input");
    let input = raw_input
        .split_terminator("\n")
        .map(|x| x.to_string())
        .map(|entry| {
            entry
                .split_terminator(" contain ")
                .map(|x| {
                    x.trim()
                        .to_string()
                        .replace("bags", "")
                        .replace("bag", "")
                        .replace(".", "")
                })
                .collect()
        })
        .collect::<Vec<Vec<String>>>();

    println!("Part One: {}", part_one(&input));
    println!("Part Two: {}", part_two(&input));
}
