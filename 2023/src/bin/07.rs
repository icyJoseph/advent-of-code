#[derive(Debug, Copy, Clone)]
enum Card {
    None,
    Num(usize),
    T,
    J,
    Q,
    K,
    A,
}

impl Card {
    fn get_value(&self, with_joker: bool) -> usize {
        match self {
            Card::Num(n) => *n,
            Card::T => 10,
            Card::J => {
                if with_joker {
                    0
                } else {
                    11
                }
            }
            Card::Q => 12,
            Card::K => 13,
            Card::A => 14,
            _ => {
                panic!("Invalid play card")
            }
        }
    }

    fn get_position(&self) -> usize {
        self.get_value(false) - 2
    }
}

#[derive(Debug)]
struct Hand {
    members: [usize; 13],
    cards: [Card; 5],
    bid: usize,
    kind: usize,
    with_joker: bool,
}

fn get_kind(members: [usize; 13], with_joker: bool) -> usize {
    let joker_index = Card::J.get_position();

    if members[joker_index] == 5 {
        return 6;
    }

    let mut copy = members.to_vec();

    if with_joker {
        copy[joker_index] = 0;
    }

    copy = copy
        .iter()
        .filter(|&x| *x != 0)
        .copied()
        .collect::<Vec<usize>>();

    copy.sort_by(|a, b| b.cmp(a));

    if with_joker {
        copy[0] += members[joker_index];
    }

    match copy[..] {
        [5] => 6,
        [4, 1] => 5,
        [3, 2] => 4,
        [3, 1, 1] => 3,
        [2, 2, 1] => 2,
        [2, 1, 1, 1] => 1,
        _ => 0,
    }
}

impl Hand {
    fn update_kind(&mut self, with_joker: bool) {
        self.kind = get_kind(self.members, with_joker);
        self.with_joker = with_joker;
    }

    fn new(spec: &str, bid: usize) -> Self {
        let mut cards = [Card::None; 5];
        let mut members = [0; 13];

        for (i, ch) in spec.chars().enumerate() {
            match ch {
                '2'..='9' => {
                    let Some(digit) = ch.to_digit(10) else {
                        panic!("Rust stuff");
                    };

                    cards[i] = Card::Num(digit as usize);
                }
                'T' => {
                    cards[i] = Card::T;
                }
                'J' => {
                    cards[i] = Card::J;
                }
                'Q' => {
                    cards[i] = Card::Q;
                }
                'K' => {
                    cards[i] = Card::K;
                }
                'A' => {
                    cards[i] = Card::A;
                }
                _ => {
                    panic!("invalid card char")
                }
            }

            members[cards[i].get_position()] += 1;
        }

        Hand {
            cards,
            members,
            bid,
            kind: 0,
            with_joker: false,
        }
    }
}

fn compare_cards(lhs: &Hand, rhs: &Hand) -> std::cmp::Ordering {
    if lhs.kind == rhs.kind {
        // tie breaker
        for i in 0..5 {
            let lhs = lhs.cards[i].get_value(lhs.with_joker);
            let rhs = rhs.cards[i].get_value(rhs.with_joker);

            if lhs == rhs {
                continue;
            }

            return lhs.cmp(&rhs);
        }
    }

    lhs.kind.cmp(&rhs.kind)
}

#[aoc2023::main(07)]
fn main(input: &str) -> (usize, usize) {
    let mut hands: Vec<Hand> = vec![];

    for line in input.lines() {
        let mut desc = line.split(' ');
        let Some(cards) = desc.next() else {
            panic!("cannot parse hand");
        };

        let Some(bid) = desc.next() else {
            panic!("cannot read bid");
        };

        let Ok(bid) = bid.parse::<usize>() else {
            panic!("cannot parse bid");
        };

        hands.push(Hand::new(cards, bid));
    }

    hands.iter_mut().for_each(|hand| {
        hand.update_kind(false);
    });

    hands.sort_by(compare_cards);

    let mut part_one = 0;

    for (pos, hand) in hands.iter().enumerate() {
        let bid = hand.bid;
        let rank = pos + 1;

        part_one += rank * bid;
    }

    hands.iter_mut().for_each(|hand| {
        hand.update_kind(true);
    });

    hands.sort_by(compare_cards);

    let mut part_two = 0;

    for (pos, hand) in hands.iter().enumerate() {
        let bid = hand.bid;
        let rank = pos + 1;

        part_two += rank * bid;
    }

    (part_one, part_two)
}
