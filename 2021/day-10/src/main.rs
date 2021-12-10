use aoc;

use std::iter::{Iterator, Peekable};

#[derive(Debug)]
struct Node {
    left: Option<char>,
    right: Option<char>,
    children: Vec<Node>,
}

impl Node {
    fn new() -> Self {
        Node {
            left: None,
            right: None,
            children: vec![],
        }
    }

    fn verify(&self) -> Option<&Node> {
        let mut children_error = None;

        for child in self.children.iter() {
            let result = child.verify();
            if result.is_some() {
                children_error = result;
                break;
            }
        }

        match children_error {
            Some(err) => Some(err),
            None => match (self.left, self.right) {
                (Some('('), Some(')')) => return None,
                (Some('['), Some(']')) => return None,
                (Some('{'), Some('}')) => return None,
                (Some('<'), Some('>')) => return None,
                (Some(_), Some(_)) => return Some(self),
                (Some(_), None) => return None,
                _ => Some(self),
            },
        }
    }

    fn complete(&self) -> Vec<char> {
        let mut acc = vec![];

        for child in self.children.iter() {
            let mut complete = child.complete();
            acc.append(&mut complete);
        }

        match (self.left, self.right) {
            (Some('{'), None) => {
                acc.push('}');
            }
            (Some('['), None) => {
                acc.push(']');
            }
            (Some('('), None) => {
                acc.push(')');
            }
            (Some('<'), None) => {
                acc.push('>');
            }
            _ => { /* Do nothing */ }
        }

        acc
    }
}

fn parse<T: Iterator<Item = char>>(peekable: &mut Peekable<T>) -> Node {
    let mut node = Node::new();

    let next = peekable.next();

    match next {
        Some('[' | '(' | '{' | '<') => {
            node.left = next;

            let mut children: Vec<Node> = vec![];

            loop {
                match peekable.peek() {
                    Some('[' | '(' | '{' | '<') => {
                        let child = parse(peekable);
                        children.push(child);
                    }
                    _ => break,
                }
            }

            node.children = children;
            node.right = peekable.next();

            return node;
        }
        Some(c) => {
            node.right = Some(c);
            return node;
        }
        None => return node,
    }
}

fn solve(raw: String) -> () {
    let rows = raw.trim().split("\n").collect::<Vec<&str>>();

    let mut incomplete: Vec<Node> = vec![];

    let mut score = 0;

    for row in rows.iter() {
        let mut it = row.chars().peekable();

        loop {
            match it.peek() {
                None => break,
                Some(_) => {
                    let result = parse(&mut it);

                    match result.verify() {
                        None => incomplete.push(result),
                        Some(err) => match err.right {
                            Some(')') => score += 3,
                            Some(']') => score += 57,
                            Some('}') => score += 1197,
                            Some('>') => score += 25137,
                            _ => { /*do nothing*/ }
                        },
                    }
                }
            }
        }
    }

    println!("Part One: {}", score);

    let mut complete_scores: Vec<u64> = vec![];

    for entry in incomplete {
        let complete = entry.complete();

        if complete.len() == 0 {
            continue;
        }

        complete_scores.push(complete.iter().fold(0, |prev, curr| match curr {
            ')' => prev * 5 + 1,
            ']' => prev * 5 + 2,
            '}' => prev * 5 + 3,
            '>' => prev * 5 + 4,
            _ => prev,
        }))
    }

    complete_scores.sort_by(|a, b| a.cmp(&b).reverse());

    println!("Part Two: {}", complete_scores[complete_scores.len() / 2]);
}

fn main() {
    // let input = std::fs::read_to_string("./input/example.in").expect("Error reading input");
    let input = aoc::get_input(2021, 10);

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
