use std::collections::HashMap;

fn get_type(card: &str) -> usize {
    let mut freq: HashMap<char, usize> = HashMap::new();

    for ch in card.chars() {
        freq.entry(ch).and_modify(|c| *c += 1).or_insert(1);
    }

    let mut sign = freq.values().copied().collect::<Vec<_>>();

    sign.sort_by(|a, b| b.cmp(&a));

    match sign[..] {
        [5] => 6,
        [4, 1] => 5,
        [3, 2] => 4,
        [3, 1, 1] => 3,
        [2, 2, 1] => 2,
        [2, 1, 1, 1] => 1,
        _ => 0,
    }
}

fn get_type_jk(card: &str) -> usize {
    if card == "JJJJJ" {
        return 6;
    }

    let mut freq: HashMap<char, usize> = HashMap::new();

    for ch in card.chars() {
        freq.entry(ch).and_modify(|c| *c += 1).or_insert(1);
    }

    let j_freq = freq.remove_entry(&'J');

    let mut sign = freq.values().copied().collect::<Vec<_>>();

    sign.sort_by(|a, b| b.cmp(&a));

    sign[0] += match j_freq {
        Some((_, c)) => c,
        None => 0,
    };

    match sign[..] {
        [5] => 6,
        [4, 1] => 5,
        [3, 2] => 4,
        [3, 1, 1] => 3,
        [2, 2, 1] => 2,
        [2, 1, 1, 1] => 1,
        _ => 0,
    }
}

#[aoc2023::main(07)]
fn main(input: &str) -> (usize, usize) {
    let mut strength = [
        'A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2',
    ]
    .iter()
    .rev()
    .enumerate()
    .map(|(a, b)| (b, a + 1))
    .collect::<HashMap<&char, usize>>();

    let mut hands: Vec<(Vec<char>, usize, usize, usize)> = vec![];

    for line in input.lines() {
        let mut desc = line.split(" ");
        let Some(hand) = desc.next() else {
            panic!("cannot parse hand");
        };

        let Some(bid) = desc.next() else {
            panic!("cannot parse bid");
        };

        let Ok(bid) = bid.parse::<usize>() else {
            panic!("cannot parse bid");
        };

        hands.push((
            hand.chars().collect::<Vec<_>>(),
            bid,
            get_type(&hand),
            get_type_jk(&hand),
        ));
    }

    hands.sort_by(|lhs, rhs| {
        if lhs.2 == rhs.2 {
            for i in 0..5 {
                if lhs.0[i] == rhs.0[i] {
                    continue;
                }

                return strength.get(&lhs.0[i]).cmp(&strength.get(&rhs.0[i]));
            }
        }

        return lhs.2.cmp(&rhs.2);
    });

    let mut part_one = 0;

    for (pos, hand) in hands.iter().enumerate() {
        let (_, bid, _, _) = hand;
        let rank = pos + 1;

        part_one += rank * bid;
    }

    strength.entry(&'J').and_modify(|c| *c = 0);

    hands.sort_by(|lhs, rhs| {
        if lhs.3 == rhs.3 {
            for i in 0..5 {
                if lhs.0[i] == rhs.0[i] {
                    continue;
                }

                return strength.get(&lhs.0[i]).cmp(&strength.get(&rhs.0[i]));
            }
        }

        return lhs.3.cmp(&rhs.3);
    });

    let mut part_two = 0;

    for (pos, hand) in hands.iter().enumerate() {
        let (_, bid, _, _) = hand;
        let rank = pos + 1;

        part_two += rank * bid;
    }

    (part_one, part_two)
}
