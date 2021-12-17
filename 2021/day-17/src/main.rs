use aoc;

fn solve(raw: String) -> () {
    let spec = raw
        .trim()
        .replace("target area: ", "")
        .split(", ")
        .map(|entry| {
            let coord = entry.split("=").collect::<Vec<&str>>()[1];
            let ranges = coord
                .split("..")
                .map(|n| parse_num::<isize>(n))
                .collect::<Vec<isize>>();
            ranges
        })
        .collect::<Vec<Vec<isize>>>();

    let lower_y = spec[1][0];

    let initial_dy = lower_y.abs() - 1;

    let max_y = initial_dy * (initial_dy + 1) / 2;

    println!("Part One: {:?}", max_y);

    let lower_x = spec[0][0];

    let upper_x = spec[0][1];
    let upper_y = spec[1][1];

    let min_dx = {
        let mut value = 0;

        loop {
            if value * (value + 1) > 2 * lower_x {
                break;
            }
            value += 1;
        }

        value
    };

    use std::collections::HashSet;

    let mut initial: HashSet<(isize, isize)> = HashSet::new();

    let x_range = lower_x..=upper_x;
    let y_range = lower_y..=upper_y;

    for dx in min_dx..=upper_x {
        for dy in lower_y..=lower_y.abs() {
            let mut velocity = [dx, dy];
            let mut position = [0, 0];

            loop {
                if x_range.contains(&position[0]) && y_range.contains(&position[1]) {
                    initial.insert((dx, dy));
                }

                if velocity[0] == 0 {
                    if !x_range.contains(&position[0]) {
                        break;
                    }
                }

                if position[1] < lower_y && velocity[1] < 0 {
                    break;
                }

                position = [position[0] + velocity[0], position[1] + velocity[1]];

                velocity = [velocity[0] - velocity[0].signum(), velocity[1] - 1];
            }
        }
    }
    println!("Part Two: {:?}", initial.len());
}

fn main() {
    let input = aoc::get_input(2021, 17);

    solve(input);
}

// Utilities
fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}
