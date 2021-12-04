use aoc;

use std::cell::Cell;

#[derive(Debug)]
struct Entry {
    checked: Cell<bool>,
    value: u32,
}

impl Entry {
    fn get_checked(&self) -> bool {
        self.checked.get()
    }
    fn update(&mut self, next: u32) {
        self.checked.set(self.checked.get() || self.value == next);
    }
}

fn solve(raw: String) -> () {
    let blocks: Vec<&str> = raw.trim().split("\n\n").collect();

    let sequence = blocks[0]
        .split(',')
        .map(|x| parse_num::<u32>(x))
        .collect::<Vec<u32>>();

    let mut cards = blocks[1..]
        .iter()
        .map(|section| {
            section
                .split("\n")
                .map(|row| {
                    row.split(" ")
                        .filter(|x| !x.is_empty())
                        .map(|x| Entry {
                            value: parse_num::<u32>(x),
                            checked: Cell::new(false),
                        })
                        .collect::<Vec<Entry>>()
                })
                .collect::<Vec<Vec<Entry>>>()
        })
        .collect::<Vec<Vec<Vec<Entry>>>>();

    use std::collections::HashSet;
    let mut set: HashSet<usize> = HashSet::new();
    let total_cards = cards.len();

    let run = || {
        for next in sequence {
            for (card_index, card) in cards.iter_mut().enumerate() {
                if set.contains(&card_index) {
                    continue;
                }

                for row in card.iter_mut() {
                    for entry in row.iter_mut() {
                        entry.update(next)
                    }
                }
                // check if the card wins
                let row_win = card
                    .iter()
                    .any(|row| row.iter().all(|entry| entry.get_checked()));

                let col_win = (0..5)
                    .collect::<Vec<usize>>()
                    .iter()
                    .map(|index| card.iter().map(|row| &row[*index]).collect::<Vec<&Entry>>())
                    .any(|col| col.iter().all(|entry| entry.get_checked()));

                if row_win || col_win {
                    if !set.contains(&card_index) {
                        set.insert(card_index);

                        if set.len() == 1 || set.len() == total_cards {
                            let score = next
                                * card.iter().fold(0, |prev, row| {
                                    prev + row
                                        .iter()
                                        .filter(|entry| !entry.get_checked())
                                        .map(|entry| entry.value)
                                        .sum::<u32>()
                                });

                            println!(
                                "Part {}: {}",
                                if set.len() == 1 { "one" } else { "two" },
                                score
                            );
                        }
                    }
                }
            }
        }
    };

    run();
}

fn main() {
    let input = aoc::get_input(2021, 4);
    // let input = std::fs::read_to_string("./input/day-4.in").expect("Error reading input");

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
