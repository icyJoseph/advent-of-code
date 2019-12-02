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

pub fn solve_day_two(filename: &str, target_output: usize) -> String {
    let commands = fs::read_to_string(filename).expect("Error reading input");

    let memory = day_two::parse(&commands);
    let max_index = memory.len();

    let mut noun = 0;
    let mut verb = 0;

    'outer: for i in 0..max_index {
        'inner: for j in 0..max_index {
            let output = *(day_two::write(day_two::replace(day_two::parse(&commands), i, j)))
                .first()
                .expect("Panic");

            if output == target_output {
                noun = i;
                verb = j;
                println!("noun: {}, verb: {}, head: {}", i, j, output);
                break 'outer;
            }
        }
    }

    return day_two::join(vec![noun, verb], "");
}
