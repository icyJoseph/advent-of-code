use std::collections::HashSet;

#[derive(Debug, Copy, Clone)]
enum Direction {
    Up = 0,
    Right,
    Down,
    Left,
}

struct Guard {
    x: usize,
    y: usize,
    dir: Direction,
}

fn step(coord: (usize, usize), dir: &Direction) -> (Option<usize>, Option<usize>) {
    let (x, y) = coord;
    match dir {
        Direction::Down => (Some(x), Some(y + 1)),
        Direction::Right => (Some(x + 1), Some(y)),
        Direction::Up => (Some(x), y.checked_sub(1)),
        Direction::Left => (x.checked_sub(1), Some(y)),
    }
}

impl Guard {
    fn new(x: usize, y: usize) -> Self {
        Guard {
            x,
            y,
            dir: Direction::Up,
        }
    }

    fn rotate(&mut self) {
        match self.dir {
            Direction::Up => self.dir = Direction::Right,
            Direction::Right => self.dir = Direction::Down,
            Direction::Down => self.dir = Direction::Left,
            Direction::Left => self.dir = Direction::Up,
        }
    }

    fn move_to(&mut self, dest: (usize, usize)) {
        self.x = dest.0;
        self.y = dest.1;
    }

    fn walk(&mut self, grid: &[Vec<char>]) -> Result<(usize, usize), ()> {
        let next = step((self.x, self.y), &self.dir);

        match next {
            (Some(x), Some(y)) => {
                let row = grid.get(y).ok_or(())?;

                let cell = row.get(x).ok_or(())?;

                if *cell == '#' {
                    self.rotate()
                } else {
                    self.move_to((x, y));
                }

                Ok((self.x, self.y))
            }
            _ => Err(()),
        }
    }
}

#[aoc2024::main(06)]
fn main(input: &str) -> (usize, usize) {
    let mut grid = input
        .lines()
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let height = grid.len();

    let Some(guard_y) = grid.iter().position(|row| row.contains(&'^')) else {
        panic!("guard_y not found")
    };

    let Some(guard_x) = grid[guard_y].iter().position(|&cell| cell == '^') else {
        panic!("guard_x not found")
    };

    let mut guard = Guard::new(guard_x, guard_y);

    let mut seen: HashSet<usize> = HashSet::new();

    seen.insert(guard_y * height + guard_x);

    while let Ok((x, y)) = guard.walk(&grid) {
        seen.insert(y * height + x);
    }

    let mut p2 = 0;

    for (y, row) in grid.iter().enumerate() {
        for (x, cell) in row.iter().enumerate() {
            if *cell == '#' {
                continue;
            }

            let mut grid = grid.clone();
            grid[y][x] = '#';

            let mut guard = Guard::new(guard_x, guard_y);

            let mut seen: HashSet<usize> = HashSet::new();

            seen.insert((guard.y * height + guard.x) * 10 + guard.dir as usize);

            while let Ok((x, y)) = guard.walk(&grid) {
                let cache = (y * height + x) * 10 + guard.dir as usize;

                if seen.contains(&cache) {
                    p2 += 1;
                    break;
                }
                seen.insert(cache);
            }
        }
    }

    (seen.len(), p2)
}
