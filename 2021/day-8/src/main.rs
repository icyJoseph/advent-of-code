use aoc;
use std::collections::HashSet;

// values that are in left but not in right.
fn diff(left: &str, right: &str) -> Vec<char> {
    let left_chars: HashSet<char> = left.chars().collect::<HashSet<char>>();
    let right_chars: HashSet<char> = right.chars().collect::<HashSet<char>>();

    left_chars
        .difference(&right_chars)
        .map(|&c| c)
        .collect::<Vec<char>>()
}

fn same(left: &str, right: &str) -> bool {
    let left_chars: HashSet<char> = left.chars().collect::<HashSet<char>>();
    let right_chars: HashSet<char> = right.chars().collect::<HashSet<char>>();

    // values that are in left or in right but not in both.
    left_chars.symmetric_difference(&right_chars).count() == 0
}

fn solve(raw: String) -> () {
    let equations = raw
        .trim()
        .split("\n")
        .map(|eq| eq.split(" | ").collect::<Vec<&str>>())
        .collect::<Vec<Vec<&str>>>();

    let mut simple_digits = 0usize;

    for equation in equations.iter() {
        simple_digits += equation[1]
            .split(" ")
            .map(|word| match word.chars().count() {
                2 | 3 | 4 | 7 => 1,
                _ => 0,
            })
            .sum::<usize>();
    }

    println!("Part one: {}", simple_digits);

    let mut total = 0;

    for equation in equations.iter() {
        let signals = equation[0];

        let inputs = signals.split(" ").collect::<Vec<&str>>();

        let one = inputs
            .iter()
            .find(|word| word.chars().count() == 2)
            .unwrap();

        let four = inputs
            .iter()
            .find(|word| word.chars().count() == 4)
            .unwrap();

        let seven = inputs
            .iter()
            .find(|word| word.chars().count() == 3)
            .unwrap();

        let eight = inputs
            .iter()
            .find(|word| word.chars().count() == 7)
            .unwrap();

        let nine = inputs
            .iter()
            .find(|word| word.chars().count() == 6 && diff(word, four).len() == 2)
            .unwrap();

        let six = inputs
            .iter()
            .find(|word| word.chars().count() == 6 && diff(word, one).len() == 5)
            .unwrap();

        let zero = inputs
            .iter()
            .find(|word| word.chars().count() == 6 && word != &six && word != &nine)
            .unwrap();

        let three = inputs
            .iter()
            .find(|word| word.chars().count() == 5 && diff(word, one).len() == 3)
            .unwrap();

        let two = inputs
            .iter()
            .find(|word| word.chars().count() == 5 && diff(word, four).len() == 3)
            .unwrap();

        let five = inputs
            .iter()
            .find(|word| word.chars().count() == 5 && word != &three && word != &two)
            .unwrap();

        let values = [zero, one, two, three, four, five, six, seven, eight, nine];

        let renders = equation[1].split(" ").collect::<Vec<&str>>();

        let mut local = 0;

        for word in renders.iter() {
            let value = values.iter().position(|signal| same(signal, word)).unwrap();

            local = local * 10 + value;
        }

        total += local;
    }

    println!("Part two: {}", total);
}

fn main() {
    let input = aoc::get_input(2021, 8);

    solve(input);
}

// Utilities
#[allow(dead_code)]
fn normal(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

#[allow(dead_code)]
fn rev_normal(norm: usize, width: usize) -> (usize, usize) {
    (norm % width, norm / width)
}

#[allow(dead_code)]
fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}
#[allow(dead_code)]
fn to_int(bin: &str) -> u32 {
    match u32::from_str_radix(bin, 2) {
        Ok(n) => n,
        _ => panic!("Error parsing binary to integer"),
    }
}

#[allow(dead_code)]
fn string_vec<T: std::string::ToString>(vec: &Vec<T>, separator: &str) -> String {
    vec.iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
        .join(separator)
}
