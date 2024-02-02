use std::collections::{HashMap, HashSet};

type Point = (usize, usize);

#[derive(Debug, PartialEq, Eq, Hash)]
struct Part {
    members: Vec<Point>,
    value: u32,
}

impl Part {
    fn add_member(&mut self, member: Point, digit: u32) {
        self.members.push(member);
        self.value = self.value * 10 + digit;
    }
}

const fn as_key(x: usize, y: usize, width: usize) -> usize {
    y * width + x
}

// adjacency around a point
fn calc_adj(members: &[Point], width: usize, height: usize) -> impl Iterator<Item = usize> + '_ {
    members
        .iter()
        .map(move |point| {
            let (x, y) = *point;

            let mut around = vec![];

            if y > 0 {
                around.push(as_key(x, y - 1, width));

                if x > 0 {
                    around.push(as_key(x - 1, y, width));
                    around.push(as_key(x - 1, y - 1, width));
                }
            }

            if y < height - 1 {
                around.push(as_key(x, y + 1, width));

                if x < width - 1 {
                    around.push(as_key(x + 1, y, width));
                    around.push(as_key(x + 1, y + 1, width));
                }
            }

            if y > 0 && x < width - 1 {
                around.push(as_key(x + 1, y - 1, width));
            }
            if x > 0 && y < height - 1 {
                around.push(as_key(x - 1, y + 1, width));
            }

            around
        })
        .flatten()
}

#[aoc2023::main(03)]
fn main(input: &str) -> (u32, u32) {
    let height = input.lines().count();
    let Some(first) = input.lines().nth(0) else {
        panic!("No first row");
    };
    let width = first.chars().count();

    let mut parts: Vec<Part> = vec![];
    let mut gears = HashMap::<usize, HashSet<usize>>::new();
    let mut occupied = HashSet::<usize>::new();

    for (y, row) in input.lines().enumerate() {
        let mut current_part: Option<Part> = None;

        for (x, ch) in row.chars().enumerate() {
            let Some(digit) = ch.to_digit(10) else {
                match ch {
                    '*' => {
                        gears.insert(as_key(x, y, width), HashSet::new());
                        occupied.insert(y * width + x);
                    }
                    _ if ch != '.' => {
                        occupied.insert(y * width + x);
                    }
                    _ => {}
                }

                if let Some(part) = current_part.take() {
                    parts.push(part);
                }

                continue;
            };

            match current_part {
                Some(mut part) => {
                    part.add_member((x, y), digit);
                    current_part = Some(part);
                }
                None => {
                    current_part = Some(Part {
                        members: vec![(x, y)],
                        value: digit,
                    });
                }
            }
        }

        if let Some(part) = current_part.take() {
            parts.push(part);
        }
    }

    let mut part_one = 0;

    let mut ratios = HashMap::<usize, u32>::new();

    for (i, part) in parts.iter().enumerate() {
        let adj = calc_adj(&part.members, width, height);

        let mut part_one_done = 0;

        for point in adj {
            if part_one_done == 0 && occupied.contains(&point) {
                part_one_done = part.value;
            }

            gears.entry(point).and_modify(|set| {
                set.insert(i);

                if set.len() == 2 {
                    if ratios.contains_key(&point) {
                        return;
                    }

                    ratios.insert(
                        point,
                        set.iter().fold(1, |acc, index| acc * parts[*index].value),
                    );
                } else {
                    ratios.remove(&point);
                }
            });
        }

        part_one += part_one_done;
    }

    let mut part_two = 0;

    for (_, ratio) in ratios {
        part_two += ratio;
    }

    (part_one, part_two)
}
