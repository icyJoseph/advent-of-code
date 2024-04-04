use std::cmp::{max, min};
use std::collections::HashSet;

#[derive(Debug)]
struct Point {
    x: usize,
    y: usize,
}

fn calc_distance(from: usize, to: usize, occupied: &HashSet<usize>) -> (usize, usize) {
    let lower = min(from, to);
    let upper = max(from, to);

    let mut planets = 0;

    for &n in occupied {
        if lower <= n && n < upper {
            planets += 1;
        }
    }

    let empty = upper - lower - planets;

    let short_dist = planets + 2 * empty;
    let long_dist = planets + 1_000_000 * empty;

    (short_dist, long_dist)
}

#[aoc2023::main(11)]
fn main(input: &str) -> (usize, usize) {
    let mut x_occupied: HashSet<usize> = HashSet::new();
    let mut y_occupied: HashSet<usize> = HashSet::new();

    let mut points: Vec<Point> = vec![];

    for (y, row) in input.lines().enumerate() {
        for (x, ch) in row.chars().enumerate() {
            if ch == '#' {
                x_occupied.insert(x);
                y_occupied.insert(y);

                points.push(Point { x, y });
            }
        }
    }

    let mut p1 = 0;
    let mut p2 = 0;

    for i in 0..points.len() {
        let current = &points[i];

        let others = &points[i + 1..];

        for other in others {
            let x_dist = calc_distance(current.x, other.x, &x_occupied);
            let y_dist = calc_distance(current.y, other.y, &y_occupied);

            p1 += x_dist.0 + y_dist.0;
            p2 += x_dist.1 + y_dist.1;
        }
    }

    (p1, p2)
}
