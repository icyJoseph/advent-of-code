use aoc;

fn solve(raw: String) -> () {
    let positions = raw
        .trim()
        .split(",")
        .map(|x| parse_num::<u32>(x))
        .collect::<Vec<u32>>();

    let max_position = *positions.iter().max().unwrap();

    let simple_fuel_calc = |target: u32| {
        positions
            .iter()
            .map(|curr| {
                if curr > &target {
                    curr - target
                } else {
                    target - curr
                }
            })
            .sum()
    };

    let comp_fuel_calc = |target: u32| {
        positions
            .iter()
            .map(|curr| {
                let diff = if curr > &target {
                    curr - target
                } else {
                    target - curr
                };

                diff * (diff + 1) / 2
            })
            .sum()
    };

    let calc_lowest_fuel = |aggregator: Box<dyn Fn(u32) -> u32>| {
        let mut lowest: Option<u32> = None;

        for pos in 0..=max_position {
            match lowest {
                Some(n) => {
                    let fuel = aggregator(pos);
                    if fuel < n {
                        lowest = Some(fuel);
                    }
                }
                _ => lowest = Some(aggregator(pos)),
            }
        }

        lowest
    };

    let part_one = calc_lowest_fuel(Box::new(simple_fuel_calc));

    let part_two = calc_lowest_fuel(Box::new(comp_fuel_calc));

    println!("Part one: {}", part_one.unwrap_or(0));

    println!("Part two: {}", part_two.unwrap_or(0));
}

fn main() {
    let input = aoc::get_input(2021, 7);

    // let input = std::fs::read_to_string("./input/day-7.in").expect("Error reading input");

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
