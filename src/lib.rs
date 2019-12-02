use std::fs;
pub mod day_one;
pub mod day_two;

pub fn solve_day_one(filename: &str) -> i32 {
    let masses = fs::read_to_string(filename).expect("Error reading input");
    masses
        .split_terminator("\n")
        .map(|x| x.parse::<i32>().unwrap())
        .fold(0, |acc, x| acc + day_one::calc_fuel_for_mass_and_fuel(x))
}

pub fn solve_day_two(filename: &str) -> String {
    let commands = fs::read_to_string(filename).expect("Error reading input");
    day_two::join(day_two::write(&day_two::replace(day_two::parse(commands))))
}
