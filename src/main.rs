use advent_of_code;
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let arg1 = &args[1];
    let arg2 = &args[2];

    let lower = arg1.parse::<u32>().expect("Problem parsing lower bound");
    let upper = arg2.parse::<u32>().expect("Problem parsing upper bound");
    let result = advent_of_code::solve_day_four(lower, upper);

    println!(
        "Day four, from: {} to: {}, result: {:?}",
        lower, upper, result
    );
}
