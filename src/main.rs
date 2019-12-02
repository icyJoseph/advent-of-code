use advent_of_code;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let filename = &args[1];
    // let total_fuel = advent_of_code::solve_day_one(filename);
    // println!("Day one, result: {}", total_fuel);
    let commands = advent_of_code::solve_day_two(filename);
    println!("Day two, result: {}", commands);
}
