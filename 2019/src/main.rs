use advent_of_code;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let filename = &args[1];
    let result = advent_of_code::solve_day_one(filename);
    println!("{}", result);
}
