use advent_of_code;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let filename = &args[1];
    let width = &args[2].parse::<usize>().expect("Could not parse width");
    let height = &args[3].parse::<usize>().expect("Could not parse height");

    advent_of_code::solve_day_eight(filename, width, height);
}
