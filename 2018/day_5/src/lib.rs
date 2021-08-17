#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_reacts() {
        assert_eq!(react(&vec!['b', 'a', 'A', 'B']), vec![]);
        assert_eq!(
            react(&vec![
                'd', 'a', 'b', 'A', 'c', 'C', 'a', 'C', 'B', 'A', 'c', 'C', 'c', 'a', 'D', 'A'
            ]),
            vec!['d', 'a', 'b', 'C', 'B', 'A', 'c', 'a', 'D', 'A']
        );
    }
}

fn react(chars: &Vec<char>) -> Vec<char> {
    if chars.len() == 0 {
        return vec![];
    }

    let mut results: Vec<Option<char>> = vec![];

    let mut it = 0;

    loop {
        let current = chars[it];

        if it == chars.len() - 1 {
            results.push(Some(current));
            break;
        }

        let next = chars[it + 1];

        use std::cmp::{max, min};

        let ascii_current = current as u32;
        let ascii_next = next as u32;

        if max(ascii_next, ascii_current) - min(ascii_next, ascii_current) == 32 {
            results.push(None);
            results.push(None);
            it += 2;
        } else {
            results.push(Some(current));
            it += 1;
        }

        if it == chars.len() {
            break;
        }
    }

    let new_chain = results
        .iter()
        .filter(|x| x.is_some())
        .map(|x| x.unwrap())
        .collect::<Vec<char>>();

    if new_chain.len() == results.len() {
        return new_chain;
    }

    react(&new_chain)
}

fn remove(code: u32, chars: &Vec<char>) -> Vec<char> {
    chars
        .iter()
        .filter(|&x| {
            let x_u32 = *x as u32;

            x_u32 != code && x_u32 != code + 32
        })
        .map(|&x| x)
        .collect::<Vec<char>>()
}

pub fn solve(raw: String) -> () {
    let polymers = raw.trim().chars().collect::<Vec<char>>();

    let reacted = react(&polymers);

    println!("Part 1: {}", reacted.len());

    let mut ascii_char = 65u32;

    let mut results = vec![];

    loop {
        let result = react(&remove(ascii_char, &polymers)).len();

        results.push(result);

        ascii_char += 1;

        if ascii_char == 90 {
            break;
        }
    }

    match results.iter().min() {
        Some(shortest) => println!("Part 2: {}", shortest),
        None => panic!("Shortest chain not found"),
    }
}
