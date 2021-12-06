use aoc;

fn solve(raw: String) -> () {
    let school = raw
        .trim()
        .split(",")
        .map(|x| parse_num::<u64>(x))
        .collect::<Vec<u64>>();

    let simulate = |target: u32| {
        let mut fish_by_day: Vec<u64> = vec![0; 9];

        for &fish in school.iter() {
            fish_by_day[fish as usize] += 1;
        }

        let mut day = 0;

        loop {
            day += 1;

            let new_fish = fish_by_day[0];

            fish_by_day[0] = 0;

            for index in 1..9usize {
                fish_by_day[index - 1] += fish_by_day[index];
                fish_by_day[index] = 0;
            }

            fish_by_day[6] += new_fish;
            fish_by_day[8] += new_fish;

            if day == target {
                break;
            }
        }

        fish_by_day.iter().sum::<u64>()
    };

    println!("Part one: {}", simulate(80));
    println!("Part one: {}", simulate(256));
}

fn main() {
    let input = aoc::get_input(2021, 6);
    // let input = std::fs::read_to_string("./input/day-6.in").expect("Error reading input");
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
