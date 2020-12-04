pub fn parse(acc: Vec<String>, row: &str) -> Vec<String> {
    let mut copy = acc.clone();
    if row.is_empty() {
        copy.push("".to_string());
        return copy;
    }

    let last = copy.pop();

    let next = match last {
        Some(word) if !word.is_empty() => format!("{} {}", word, row),
        _ => row.to_string(),
    };

    copy.push(next);
    return copy;
}

pub fn collect_password(entry: String) -> Vec<(String, String)> {
    entry
        .split_terminator(" ")
        .map(|pair| {
            let split: Vec<&str> = pair.split_terminator(":").collect();
            match (split.get(0), split.get(1)) {
                (Some(&a), Some(&b)) => (a.to_string(), b.to_string()),
                _ => panic!("Bad value pair"),
            }
        })
        .collect()
}

fn has_mandatory_fields(passport: &Vec<(String, String)>) -> bool {
    ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"]
        .iter()
        .all(
            |field| match passport.into_iter().find(|entry| &entry.0 == field) {
                Some(_) => true,
                _ => false,
            },
        )
}

use std::iter::{Iterator, Peekable};

fn parse_number<T: Iterator<Item = char>>(peekable: &mut Peekable<T>, acc: i32) -> i32 {
    match peekable.peek() {
        Some(peek) => match peek.to_string().parse::<i32>() {
            Ok(n) => {
                peekable.next();
                parse_number(peekable, acc * 10 + n)
            }
            _ => return acc,
        },
        _ => return acc,
    }
}

fn year_validation(field_value: &String, min: i32, max: i32) -> bool {
    if field_value.len() != 4 {
        return false;
    }

    let mut it = field_value.chars().peekable();
    let year = parse_number(&mut it, 0);

    year >= min && year <= max
}

fn height_validation(field_value: &String) -> bool {
    if field_value.len() >= 6 && field_value.len() <= 3 {
        return false;
    }

    let mut it = field_value.chars().rev().peekable();

    match it.peek() {
        Some('n') => {
            it.next();
            match it.peek() {
                Some('i') => {
                    let height = parse_number(&mut field_value.chars().peekable(), 0);
                    height >= 59 && height <= 76
                }
                _ => return false,
            }
        }
        Some('m') => {
            it.next();
            match it.peek() {
                Some('c') => {
                    let height = parse_number(&mut field_value.chars().peekable(), 0);
                    height >= 150 && height <= 193
                }
                _ => return false,
            }
        }
        _ => return false,
    }
}

fn hex_color_validation(field_value: &String) -> bool {
    if field_value.len() != 7 {
        return false;
    }

    let mut it = field_value.chars().peekable();
    match it.peek() {
        Some('#') => {
            it.next();
            return it.all(|c| "abcdef0123456789".contains(c));
        }
        _ => false,
    }
}

fn eye_color_validation(field_value: &String) -> bool {
    match ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"]
        .iter()
        .find(|&x| x == field_value)
    {
        Some(_) => true,
        _ => false,
    }
}

fn pid_validation(field_value: &String) -> bool {
    if field_value.len() != 9 {
        return false;
    }

    field_value.chars().all(|c| "0123456789".contains(c))
}

fn has_valid_fields(passport: &Vec<(String, String)>) -> bool {
    passport
        .into_iter()
        .all(|passport_field| match &passport_field.0[..] {
            "byr" => year_validation(&passport_field.1, 1920, 2002),
            "iyr" => year_validation(&passport_field.1, 2010, 2020),
            "eyr" => year_validation(&passport_field.1, 2020, 2030),
            "hgt" => height_validation(&passport_field.1),
            "hcl" => hex_color_validation(&passport_field.1),
            "ecl" => eye_color_validation(&passport_field.1),
            "pid" => pid_validation(&passport_field.1),
            "cid" => return true,
            _ => return false,
        })
}

pub fn part_one(passports: &Vec<Vec<(String, String)>>) -> usize {
    passports.into_iter().fold(0, |prev, passport| {
        if has_mandatory_fields(&passport) {
            return prev + 1;
        }
        prev
    })
}

pub fn part_two(passports: &Vec<Vec<(String, String)>>) -> usize {
    passports.into_iter().fold(0, |prev, passport| {
        if has_mandatory_fields(&passport) && has_valid_fields(&passport) {
            return prev + 1;
        }
        prev
    })
}
