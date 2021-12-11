use aoc;

use std::cell::Cell;
use std::collections::{HashSet, VecDeque};
use std::hash::{Hash, Hasher};

#[derive(PartialEq, Eq)]
struct Octopus {
    value: Cell<u32>,
    index: usize,
}

impl Hash for Octopus {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.index.hash(state);
    }
}

impl Octopus {
    fn new(c: char, index: usize) -> Self {
        let value = c.to_digit(10).expect("Failed to parse cell value");
        Octopus {
            value: Cell::new(value),
            index,
        }
    }

    fn get_value(&self) -> u32 {
        self.value.get()
    }

    fn radiate(&self) {
        self.value.set(self.value.get() + 1);
    }

    fn reset(&self) {
        self.value.set(0);
    }
}

fn solve(raw: String) -> () {
    let rows = raw.trim().split("\n").collect::<Vec<&str>>();

    let height = rows[0].len();
    let width = rows[0].chars().count();

    let grid = rows
        .iter()
        .enumerate()
        .flat_map(|(y, row)| {
            row.chars()
                .enumerate()
                .map(|(x, c)| Octopus::new(c, norm(x, y, width)))
                .collect::<Vec<Octopus>>()
        })
        .collect::<Vec<Octopus>>();

    let adj = calc_adj(height, width);

    let mut step = 0;
    let mut total_flashes = 0;

    loop {
        if grid.iter().all(|oct| oct.get_value() == 0) {
            break;
        }

        step += 1;

        grid.iter().for_each(|oct| oct.radiate());

        let mut scheduled: VecDeque<&Octopus> =
            grid.iter().filter(|oct| oct.get_value() > 9).collect::<_>();

        let mut radiated: HashSet<&Octopus> = HashSet::new();

        loop {
            let next = scheduled.pop_front();

            match next {
                None => break,

                Some(current_oct) => {
                    let index = current_oct.index;

                    if radiated.contains(current_oct) {
                        continue;
                    }

                    radiated.insert(current_oct);

                    for v in &adj[index] {
                        let v_oct = &grid[*v];

                        v_oct.radiate();

                        if v_oct.get_value() > 9 {
                            if !radiated.contains(v_oct) {
                                scheduled.push_back(v_oct)
                            }
                        }
                    }
                }
            }
        }

        total_flashes += radiated.len();

        for oct in radiated {
            oct.reset();
        }

        if step == 100 {
            println!("Part One: {}", total_flashes);
        }
    }

    println!("Part Two: {}", step);
}

fn main() {
    let input = aoc::get_input(2021, 11);

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

type Adj = Vec<Vec<usize>>;

fn norm(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

fn calc_adj(height: usize, width: usize) -> Adj {
    let mut adj = vec![vec![]; height * width];

    for y in 0..height {
        for x in 0..width {
            let index = norm(x, y, width);

            if x > 0 {
                adj[index].push(norm(x - 1, y, width));
            }
            if y + 1 < height {
                adj[index].push(norm(x, y + 1, width));
            }
            if x + 1 < width {
                adj[index].push(norm(x + 1, y, width));
            }
            if y > 0 {
                adj[index].push(norm(x, y - 1, width));
            }

            if x > 0 && y > 0 {
                adj[index].push(norm(x - 1, y - 1, width));
            }
            if x > 0 && y + 1 < height {
                adj[index].push(norm(x - 1, y + 1, width));
            }
            if x + 1 < width && y > 0 {
                adj[index].push(norm(x + 1, y - 1, width));
            }
            if x + 1 < width && y + 1 < height {
                adj[index].push(norm(x + 1, y + 1, width));
            }
        }
    }

    adj
}
