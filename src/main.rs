use advent_of_code;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let filename = &args[1];

    let target = &args[2];

    let target_output = target.parse::<usize>().expect("Failed to parse target");
    let commands = advent_of_code::solve_day_two(filename, target_output);
    println!("{}, result: {}", filename, commands);
}
