#[aoc2022::main(03)]
fn main(input: &str) -> (usize, usize) {
    let lowercase_bound = 'a' as usize - 1;
    let uppercase_bound = 'A' as usize - 27;

    let sacks = input
        .split_terminator('\n')
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<_>>();

    use std::collections::{HashMap, HashSet};

    use std::iter::FromIterator;

    let part_one = sacks
        .iter()
        .map(|sack| {
            vec![
                sack[0..sack.len() / 2].to_vec(),
                sack[sack.len() / 2..].to_vec(),
            ]
        })
        .map(|sack| {
            let left: HashSet<char> = HashSet::from_iter(sack[0].iter().copied());
            let right: HashSet<char> = HashSet::from_iter(sack[1].iter().copied());

            let inter = left
                .intersection(&right)
                .into_iter()
                .copied()
                .collect::<Vec<_>>();

            inter[0]
        })
        .map(|ch| {
            if ch.is_lowercase() {
                ch as usize - lowercase_bound
            } else {
                ch as usize - uppercase_bound
            }
        })
        .sum::<usize>();

    let part_two = sacks
        .chunks(3)
        .map(|triple| {
            let unique: HashSet<char> = HashSet::from_iter(triple.iter().flatten().copied());

            let mut dict: HashMap<char, usize> = HashMap::new();

            for sacks in triple.iter() {
                let local_unique: HashSet<&char> = HashSet::from_iter(sacks.iter());

                for &ch in local_unique {
                    *dict.entry(ch).or_insert(0) += 1
                }
            }

            let badge = *unique
                .iter()
                .find(|ch| *dict.get(ch).unwrap() == 3)
                .unwrap();

            if badge.is_lowercase() {
                badge as usize - lowercase_bound
            } else {
                badge as usize - uppercase_bound
            }
        })
        .sum::<usize>();

    (part_one, part_two)
}
