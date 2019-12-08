use std::fs;
pub mod day_eight;
pub mod day_four;
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

    let segments = day_two::segment(&commands);
    let max_index = segments.len();

    let mut noun = 0;
    let mut verb = 0;

    'outer: for i in 0..max_index {
        'inner: for j in 0..max_index {
            let output = *(day_two::write(day_two::replace(day_two::parse(&segments), i, j)))
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

    return day_two::join(vec![noun, verb], Some(""));
}

pub fn solve_day_four(lower: u32, upper: u32) -> (usize, usize) {
    return day_four::find_numbers(lower, upper);
}

pub fn solve_day_eight(filename: &str, width: &usize, height: &usize) {
    let raw_data = fs::read_to_string(filename).expect("Error reading input");
    day_eight::decode_stream(raw_data, width, height);
}
