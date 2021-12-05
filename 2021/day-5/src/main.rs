use aoc;
use std::cmp::{max, min};
use std::collections::HashMap;

type Point = (usize, usize);

fn normal(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

fn expand((x1, y1): Point, (x2, y2): Point, skip_diagonals: bool) -> Vec<Point> {
    let min_x = min(x1, x2);
    let max_x = max(x1, x2);

    let min_y = min(y1, y2);
    let max_y = max(y1, y2);

    if x1 == x2 {
        return (min_y..=max_y)
            .collect::<Vec<usize>>()
            .iter()
            .map(|&y| (x1, y))
            .collect::<Vec<Point>>();
    }

    if y1 == y2 {
        return (min_x..=max_x)
            .collect::<Vec<usize>>()
            .iter()
            .map(|&x| (x, y1))
            .collect::<Vec<Point>>();
    }

    if skip_diagonals {
        return vec![];
    }

    let start_y = if min_x == x1 { y1 } else { y2 };
    let end_y = if max_x == x1 { y1 } else { y2 };

    return (min_x..=max_x)
        .collect::<Vec<usize>>()
        .iter()
        .scan(0usize, |state, &x| {
            let current_step = *state;
            *state += 1;

            Some((
                x,
                if end_y > start_y {
                    start_y + current_step
                } else {
                    start_y - current_step
                },
            ))
        })
        .collect::<Vec<Point>>();
}

fn solve(raw: String) -> () {
    let coords = raw
        .trim()
        .split("\n")
        .map(|row| {
            let spec = row.split(" -> ").collect::<Vec<&str>>();

            let start = spec[0]
                .split(",")
                .map(|s| parse_num::<usize>(s))
                .collect::<Vec<usize>>();
            let end = spec[1]
                .split(",")
                .map(|s| parse_num::<usize>(s))
                .collect::<Vec<usize>>();

            return ((start[0], start[1]), (end[0], end[1]));
        })
        .collect::<Vec<(Point, Point)>>();

    let width = 1 + coords
        .iter()
        .map(|(start, end)| max(start.0, end.0))
        .max()
        .unwrap_or(0);

    let count_overlaps = move |skip_diagonals: bool| {
        let mut table: HashMap<usize, usize> = HashMap::new();

        for coord in coords.iter() {
            let points = expand(coord.0, coord.1, skip_diagonals);

            for point in points {
                let norm = normal(point.0, point.1, width);
                *table.entry(norm).or_insert(0) += 1;
            }
        }

        table.iter().filter(|(_, &value)| value > 1).count()
    };

    println!("Part one: {}", count_overlaps(true));
    println!("Part two: {}", count_overlaps(false));
}

fn main() {
    let input = aoc::get_input(2021, 5);
    // let input = std::fs::read_to_string("./input/day-5.in").expect("Error reading input");

    solve(input);
}

// Utilities

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
