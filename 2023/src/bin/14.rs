use std::cell::Cell;

struct Grid(Cell<Vec<Vec<char>>>);

impl Grid {
    fn new(input: &str) -> Self {
        let grid = input
            .lines()
            .map(|line| line.chars().collect::<Vec<_>>())
            .collect::<Vec<_>>();

        Grid(Cell::new(grid))
    }

    fn get(&mut self) -> &mut Vec<Vec<char>> {
        self.0.get_mut()
    }

    fn len(&mut self) -> usize {
        self.0.get_mut().len()
    }

    fn tilt(&mut self) {
        for r in 1..self.len() {
            for c in 0..self.get()[r].len() {
                if self.get()[r][c] != ROCK {
                    continue;
                }

                let mut step = 0;

                while r > step {
                    if self.get()[r - (step + 1)][c] == EMPTY {
                        step += 1;
                    } else {
                        break;
                    }
                }
                self.get()[r][c] = EMPTY;
                self.get()[r - step][c] = ROCK;
            }
        }
    }

    fn score(&mut self) -> usize {
        let len = self.len();

        let mut acc = 0;

        for (i, row) in self.get().iter().enumerate() {
            for ch in row {
                if *ch == 'O' {
                    acc += len - i;
                }
            }
        }

        acc
    }

    fn rotate_cw(&mut self) {
        let len = self.len();

        let grid = self.get();

        for i in 0..len / 2 {
            for j in 0..len {
                let temp = grid[i][j];
                grid[i][j] = grid[len - i - 1][j];
                grid[len - i - 1][j] = temp;
            }
        }

        for i in 0..len {
            for j in i + 1..len {
                let temp = grid[i][j];
                grid[i][j] = grid[j][i];
                grid[j][i] = temp;
            }
        }
    }

    fn pretty_print(&mut self) -> String {
        self.get()
            .iter()
            .map(|r| r.iter().collect::<String>())
            .collect::<Vec<String>>()
            .join("\n")
    }
}

const ROCK: char = 'O';
// const WALL: char = '#';
const EMPTY: char = '.';
const LOOPS: usize = 1_000_000_000;

#[aoc2023::main(14)]
fn main(input: &str) -> (usize, usize) {
    let mut grid = Grid::new(input);

    grid.tilt();

    let part_one = grid.score();

    use std::collections::HashMap;

    let mut seen: HashMap<String, usize> = HashMap::new();

    let mut cycle = 0;

    loop {
        for _ in 0..4 {
            grid.tilt();
            grid.rotate_cw();
        }

        cycle += 1;

        if cycle == LOOPS {
            break;
        }

        let key = grid.pretty_print();

        if seen.contains_key(&key) {
            let Some(prev) = seen.get(&key) else {
                panic!("unexpected error");
            };

            let period = cycle - prev;

            let todo = LOOPS - cycle;

            cycle = LOOPS - (todo % period);

            continue;
        }

        seen.insert(key, cycle);
    }

    (part_one, grid.score())
}
