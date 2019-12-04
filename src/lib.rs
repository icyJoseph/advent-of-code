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

pub fn rule_one(digits: &Vec<u32>) -> bool {
    digits.len() == 6
}

pub fn rule_two(digits: &Vec<u32>) -> bool {
    for (index, digit) in digits.iter().enumerate() {
        let next = digits.get(index + 1);
        if let Some(val) = next {
            if *val == *digit {
                return true;
            }
            continue;
        }
    }
    return false;
}

pub fn rule_three(digits: &Vec<u32>) -> bool {
    for (index, digit) in digits.iter().enumerate() {
        let next = digits.get(index + 1).or(Some(&digit)).unwrap();
        if *next < *digit {
            return false;
        }
    }
    return true;
}

pub fn solve_day_four(lower: u32, upper: u32) -> (usize, usize) {
    let funcs = [rule_one, rule_two, rule_three];

    let mut problem_one: Vec<u32> = vec![];
    let problem_two: Vec<u32> = vec![];

    for number in lower..=upper {
        let digits: Vec<u32> = number
            .to_string()
            .chars()
            .map(|x| x.to_digit(10).unwrap())
            .collect();

        let matches_problem_one = funcs.iter().fold(true, |prev, curr| prev && curr(&digits));

        if matches_problem_one {
            problem_one.push(number);
        }
    }
    println!("{}", problem_one.len());
    return (problem_one.len(), problem_two.len());
}
