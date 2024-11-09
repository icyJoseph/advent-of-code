use std::collections::{HashMap, HashSet};

struct Part {
    id: usize,
    value: u32,
    is_valid: bool,
}

impl Part {
    fn update_value(&mut self, digit: u32) {
        self.value = self.value * 10 + digit;
    }

    fn set_valid(&mut self) {
        self.is_valid = true;
    }
}

const fn is_symbol(ch: char) -> bool {
    !matches!(ch, '0'..='9' | '.')
}

fn find_gears(arr: &str, at: usize, y: usize, gears: &mut Vec<(usize, usize)>) -> bool {
    let lower = if at == 0 { 0 } else { at - 1 };
    let upper = if at == arr.len() - 1 { at } else { at + 1 };

    let mut any_symbol = false;
    let mut x = lower;

    for ch in arr[lower..=upper].chars() {
        if is_symbol(ch) {
            any_symbol = true;
        }

        if ch == '*' {
            gears.push((x, y))
        }
        x += 1;
    }

    any_symbol
}

#[aoc2023::main(03)]
fn main(input: &str) -> (u32, u32) {
    let mut it = input.lines().enumerate().peekable();

    let mut prev: Option<(usize, &str)> = None;

    let mut gears = HashMap::<(usize, usize), HashSet<usize>>::new();
    let mut parts = HashMap::<usize, u32>::new();
    let mut part_id = 0;

    let mut part_one = 0;
    let mut part_two = 0;

    while let Some(current) = it.next() {
        let (y, row) = current;

        let next = it.peek();

        let mut current_part: Option<Part> = None;

        for (x, ch) in row.chars().enumerate() {
            let Some(digit) = ch.to_digit(10) else {
                let Some(part) = current_part.take() else {
                    continue;
                };

                if part.is_valid {
                    part_one += part.value;
                    parts.insert(part.id, part.value);
                }

                continue;
            };

            match current_part {
                Some(mut part) => {
                    part.update_value(digit);
                    current_part = Some(part);
                }
                None => {
                    current_part = Some(Part {
                        id: part_id,
                        value: digit,
                        is_valid: false,
                    });
                    part_id += 1;
                }
            }

            let Some(mut part) = current_part.take() else {
                panic!("Expected a part to work with");
            };

            let mut acc_gears: Vec<(usize, usize)> = vec![];

            let in_prev = match prev {
                Some((_, p_row)) => find_gears(p_row, x, y - 1, &mut acc_gears),
                None => false,
            };

            let in_next = match next {
                Some((_, n_row)) => find_gears(n_row, x, y + 1, &mut acc_gears),
                None => false,
            };

            let in_row = find_gears(row, x, y, &mut acc_gears);

            if in_row || in_prev || in_next {
                part.set_valid();
            }

            for &(sx, sy) in &acc_gears {
                gears.entry((sx, sy)).or_default().insert(part.id);
            }

            current_part = Some(part);
        }

        prev = Some(current);

        let Some(part) = current_part else {
            continue;
        };

        if part.is_valid {
            part_one += part.value;
            parts.insert(part.id, part.value);
        }
    }

    for (_, ids) in gears {
        if ids.len() == 2 {
            part_two += ids.iter().filter_map(|id| parts.get(id)).product::<u32>();
        }
    }

    (part_one, part_two)
}
