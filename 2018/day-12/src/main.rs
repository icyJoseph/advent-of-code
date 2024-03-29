use aoc;

use std::cell::Cell;

#[derive(Debug)]
struct Pot {
    position: i64,
    plant: Cell<char>,
    update: Option<char>,
}

impl Pot {
    fn new(position: i64, plant: char) -> Self {
        Pot {
            position,
            plant: Cell::new(plant),
            update: None,
        }
    }

    fn batch_update(&mut self, next: char) -> () {
        self.update = Some(next);
    }

    fn flush_update(&mut self) -> () {
        match self.update {
            Some(update) => self.plant.set(update),
            None => {
                //self.plant.set('.');
            }
        }

        self.update = None;
    }
}

fn solve(raw: String) -> () {
    let spec = raw.trim().split("\n\n").collect::<Vec<&str>>();

    let seed = spec[0].replace("initial state: ", "");

    let rules = spec[1]
        .split("\n")
        .collect::<Vec<_>>()
        .iter()
        .map(|x| {
            let equation = x.split(" => ").collect::<Vec<_>>();
            let input = equation[0];
            match equation[1].chars().next() {
                Some(output) => (input, output),
                None => panic!("Equation did not have output"),
            }
        })
        .collect::<Vec<(&str, char)>>();

    let mut state = seed
        .chars()
        .enumerate()
        .map(|(i, c)| Pot::new(i as i64, c))
        .collect::<Vec<_>>();

    let mut generation = 1;

    // seed the state with empty positions
    let seed_state = |pot_state: &mut Vec<Pot>| {
        // push two at the beginning and two at the end
        let head_position = pot_state[0].position;

        let tail_position = pot_state[pot_state.len() - 1].position;

        pot_state.insert(0, Pot::new(head_position - 1, '.'));
        pot_state.insert(0, Pot::new(head_position - 2, '.'));

        pot_state.push(Pot::new(tail_position + 1, '.'));
        pot_state.push(Pot::new(tail_position + 2, '.'));
    };

    seed_state(&mut state);

    let mut prev = None;
    let mut prediction = None;
    let mut consistent = 0;

    loop {
        seed_state(&mut state);

        for i in 2..state.len() - 2 {
            let slice = state[i - 2..i + 3]
                .iter()
                .map(|x| x.plant.get())
                .collect::<String>();

            match rules.iter().find(|(input, _)| *input == slice) {
                Some((_, output)) => {
                    state[i].batch_update(*output);
                }
                None => {}
            }
        }

        for pot in state.iter_mut() {
            pot.flush_update();
        }

        let sum = state
            .iter()
            .filter(|p| p.plant.get() == '#')
            .map(|p| p.position)
            .sum::<i64>();

        if generation == 20 {
            println!("Part 1: {}", sum);
        }

        match prev {
            Some(p) => {
                match prediction {
                    Some(pred) if pred == sum => {
                        consistent += 1;
                        if consistent > 3 {
                            println!("Part 2: {}", (sum - p) * (50000000000 - generation) + sum);
                            break;
                        }
                    }
                    _ => {
                        consistent = 0;
                    }
                }

                let diff = sum - p;
                prediction = Some(diff + sum);
                prev = Some(sum);
            }
            None => prev = Some(sum),
        }

        generation += 1;
    }
}

fn main() {
    let _input = "initial state: #..#.#..##......###...###

...## => #
..#.. => #
.#... => #
.#.#. => #
.#.## => #
.##.. => #
.#### => #
#.#.# => #
#.### => #
##.#. => #
##.## => #
###.. => #
###.# => #
####. => #
    "
    .to_string();
    let input = aoc::get_input(2018, 12);
    solve(input);
}
