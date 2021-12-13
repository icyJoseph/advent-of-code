use aoc;

use std::collections::HashSet;

#[derive(Hash, PartialEq, Eq)]
struct Point {
    x: usize,
    y: usize,
}

impl Point {
    fn fold(&mut self, dir: &str, at: usize) {
        match dir {
            "x" => {
                self.x = if self.x > at { 2 * at - self.x } else { self.x };
            }
            "y" => {
                self.y = if self.y > at { 2 * at - self.y } else { self.y };
            }
            _ => {}
        }
    }
}

fn solve(raw: String) -> () {
    let spec = raw.trim().split("\n\n").collect::<Vec<&str>>();

    let mut dots = spec[0]
        .split("\n")
        .map(|row| {
            let coords = row
                .split(",")
                .map(|c| parse_num::<usize>(c))
                .collect::<Vec<usize>>();

            Point {
                x: coords[0],
                y: coords[1],
            }
        })
        .collect::<Vec<Point>>();

    let instructions = spec[1].split("\n");

    let mut part_one = true;

    for entry in instructions {
        let spec = entry.replace("fold along ", "");
        let inst = spec.split("=").collect::<Vec<&str>>();

        let dir = inst[0];
        let at = parse_num::<usize>(inst[1]);

        dots.iter_mut().for_each(|p: &mut Point| p.fold(dir, at));

        if part_one {
            let mut visible: HashSet<&Point> = HashSet::new();

            dots.iter().for_each(|p| {
                visible.insert(p);
            });

            println!("Part Two: {}", visible.len());

            part_one = false
        }
    }

    let width = dots.iter().max_by(|p, q| p.x.cmp(&q.x)).unwrap().x;

    let height = dots.iter().max_by(|p, q| p.y.cmp(&q.y)).unwrap().y;

    let mut board = vec![vec![' '; width + 1]; height + 1];

    dots.iter().for_each(|p| board[p.y][p.x] = '#');

    println!("Part Two:");

    for row in board {
        println!("{}", string_vec(&row, ""));
    }
}

fn main() {
    let input = aoc::get_input(2021, 13);

    solve(input);
}

// Utilities
fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}

fn string_vec<T: std::string::ToString>(vec: &Vec<T>, separator: &str) -> String {
    vec.iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
        .join(separator)
}
