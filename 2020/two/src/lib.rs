#[derive(Debug)]
pub struct Entry {
    min: usize,
    max: usize,
    letter: char,
    chars: Vec<char>,
}

pub fn consume_entry(raw_entry: &str) -> Entry {
    let data: Vec<String> = raw_entry
        .split_terminator(": ")
        .map(|x| x.to_string())
        .collect();

    let (min, max, letter) = match data.get(0) {
        Some(p) => {
            let policy: Vec<String> = p.split_terminator(" ").map(|x| x.to_string()).collect();

            let letter = match policy.get(1) {
                Some(l) => l.chars().next().unwrap(),
                _ => panic!("No letter"),
            };

            let (min, max) = match policy.get(0) {
                Some(r) => {
                    let range: Vec<usize> = r
                        .split_terminator('-')
                        .map(|x| x.parse::<usize>().unwrap())
                        .collect();
                    (range[0], range[1])
                }
                _ => panic!("No range"),
            };

            (min, max, letter)
        }
        _ => panic!("No policy"),
    };

    let chars = match data.get(1) {
        Some(password) => password.chars().collect(),
        _ => panic!("No Password"),
    };

    return Entry {
        min,
        max,
        letter,
        chars,
    };
}

pub fn part_one(entries: &Vec<Entry>) -> usize {
    let valid: Vec<&Entry> = entries
        .into_iter()
        .filter(|entry| {
            let rank: Vec<&char> = entry
                .chars
                .iter()
                .filter(|&ch| *ch == entry.letter)
                .collect();
            return rank.len() >= entry.min && rank.len() <= entry.max;
        })
        .collect();
    return valid.len();
}

pub fn part_two(entries: &Vec<Entry>) -> usize {
    let valid: Vec<&Entry> = entries
        .into_iter()
        .filter(|entry| {
            let first = *match entry.chars.get(entry.min - 1) {
                Some(c) => c,
                _ => panic!("No first char in password"),
            };
            let second = *match entry.chars.get(entry.max - 1) {
                Some(c) => c,
                _ => panic!("No first char in password"),
            };

            return first != entry.letter && second == entry.letter
                || first == entry.letter && second != entry.letter;
        })
        .collect();
    return valid.len();
}
