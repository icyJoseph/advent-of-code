use aoc;

#[derive(Copy, Clone, Debug)]
struct Marble {
    value: usize,
    prev: Option<usize>,
    next: Option<usize>,
}

impl Marble {
    fn new(value: usize) -> Self {
        Marble {
            value,
            prev: None,
            next: None,
        }
    }

    fn update_next<'a>(&'a mut self, next: Option<usize>) -> &'a mut Self {
        self.next = next;

        self
    }

    fn update_prev<'a>(&'a mut self, prev: Option<usize>) -> &'a mut Self {
        self.prev = prev;

        self
    }
}

fn solve(raw: &String, mult: usize) -> usize {
    let input = raw
        .trim()
        .replace(" players; last marble is worth", "")
        .replace(" points", "");

    let spec = input
        .split(" ")
        .map(|x| x.parse::<usize>().unwrap())
        .collect::<Vec<usize>>();

    let last_marble = spec[1] * mult + 1;

    let mut marbles = (0..last_marble)
        .map(|x| Marble::new(x))
        .collect::<Vec<Marble>>();

    let all = (0..last_marble).collect::<Vec<usize>>();

    let mut it = all.iter();

    match it.next() {
        Some(index) => {
            marbles[*index].update_next(Some(0)).update_prev(Some(0));
        }
        None => panic!("No starting marble"),
    }

    let mut player = 0;
    let mut scores = vec![0; spec[0]];

    let mut current_marble = Some(marbles[0]);

    loop {
        match it.next() {
            Some(index) => {
                let m = marbles[*index];

                if m.value % 23 == 0 {
                    // add scores and remove -7
                    scores[player] = scores[player] + m.value;

                    let mut remove = current_marble;

                    for _ in 0..7 {
                        match remove {
                            Some(c) => match c.prev {
                                Some(p) => remove = Some(marbles[p]),
                                None => panic!("Can't walk backwards, missing prev"),
                            },
                            None => panic!("Can't walk 7 steps counterclockwise"),
                        }
                    }

                    match remove {
                        Some(r) => {
                            match (r.prev, r.next) {
                                (Some(p), Some(n)) => {
                                    marbles[p].update_next(Some(n));
                                    marbles[n].update_prev(Some(p));

                                    current_marble = Some(marbles[n]);
                                }
                                _ => panic!("Removable did not have prev"),
                            }

                            scores[player] = scores[player] + r.value;
                        }
                        None => panic!("Nothing to remove"),
                    }
                } else {
                    match current_marble {
                        Some(c) => {
                            // insert
                            match c.next {
                                Some(n) => {
                                    match marbles[n].next {
                                        Some(o) => {
                                            // tell the +1 to point to a new value
                                            marbles[n].update_next(Some(m.value));
                                            // tell the +1 to point back to the new value
                                            marbles[o].update_prev(Some(m.value));

                                            // update the new value
                                            marbles[m.value].update_prev(Some(n));
                                            marbles[m.value].update_next(Some(o));
                                        }

                                        None => panic!("Follower did not have a next"),
                                    }

                                    current_marble = Some(marbles[*index]);
                                }
                                None => panic!("Current marble did not have next"),
                            }
                        }

                        None => panic!("No current marble"),
                    }
                }
            }
            None => break,
        }

        player += 1;

        player = player % spec[0];
    }

    match scores.iter().max() {
        Some(&m) => m,
        None => panic!("Game ran incorrectly"),
    }
}

fn main() {
    let input = aoc::get_input(2018, 9);
    println!("Part 1: {}", solve(&input, 1));
    println!("Part 2: {}", solve(&input, 100));
}

#[test]
fn examples() {
    let input = "10 players; last marble is worth 1618 points".to_string();
    assert_eq!(solve(&input, 1), 8317);
    let input = "13 players; last marble is worth 7999 points".to_string();
    assert_eq!(solve(&input, 1), 146373);
    let input = "17 players; last marble is worth 1104 points".to_string();
    assert_eq!(solve(&input, 1), 2764);
    let input = "21 players; last marble is worth 6111 points".to_string();
    assert_eq!(solve(&input, 1), 54718);
    let input = "30 players; last marble is worth 5807 points".to_string();
    assert_eq!(solve(&input, 1), 37305);
}
