#[aoc2023::main(02)]
fn main(input: &str) -> (usize, usize) {
    input
        .lines()
        .enumerate()
        .map(|(game, line)| {
            let desc = line.split(": ");

            let Some(tail) = desc.last() else {
                panic!("Not game results tail");
            };

            let results = tail
                .split("; ")
                .map(|draw| draw.split(", ").map(|dice| dice.split(' ')));

            let mut max_red: usize = 0;
            let mut max_green: usize = 0;
            let mut max_blue: usize = 0;

            use std::cmp::{max, min};

            let mut invalid_rolls = 0;

            for draw in results {
                for mut dice in draw {
                    let Some(roll) = dice.next() else {
                        panic!("Cannot get roll");
                    };

                    let Some(color) = dice.next() else {
                        panic!("Cannot get color");
                    };

                    let Ok(value) = roll.parse::<usize>() else {
                        panic!("Can't parse the roll");
                    };

                    match color {
                        "red" => {
                            invalid_rolls += max(value, 12) - 12;
                            max_red = max(value, max_red);
                        }
                        "green" => {
                            invalid_rolls += max(value, 13) - 13;
                            max_green = max(value, max_green);
                        }
                        "blue" => {
                            invalid_rolls += max(value, 14) - 14;
                            max_blue = max(value, max_blue);
                        }
                        _ => {}
                    }
                }
            }

            let p1 = (game + 1) * (1 - min(invalid_rolls, 1));

            let p2 = max_red * max_green * max_blue;

            (p1, p2)
        })
        .fold((0, 0), |acc, curr| (acc.0 + curr.0, acc.1 + curr.1))
}
