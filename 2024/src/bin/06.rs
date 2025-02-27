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
    start_x: usize,
    start_y: usize,
    height: usize,
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
    fn new(x: usize, y: usize, height: usize) -> Self {
        Guard {
            x,
            y,
            height,
            start_x: x,
            start_y: y,
            dir: Direction::Up,
        }
    }

    fn reset(&mut self) {
        self.x = self.start_x;
        self.y = self.start_y;
        self.dir = Direction::Up;
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

    fn hash(&self) -> usize {
        self.y * self.height + self.x
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

    let mut guard = Guard::new(guard_x, guard_y, height);

    let mut path: HashSet<usize> = HashSet::new();

    path.insert(guard.hash());

    while guard.walk(&grid).is_ok() {
        path.insert(guard.hash());
    }

    let mut p2 = 0;

    let mut seen: HashSet<usize> = HashSet::new();

    for index in path.iter() {
        let x = index % height;
        let y = index / height;

        let cell = grid[y][x];

        if cell == '#' || cell == '^' {
            continue;
        }

        seen.clear();
        guard.reset();

        grid[y][x] = '#';

        seen.insert(guard.hash() * 10 + guard.dir as usize);

        while guard.walk(&grid).is_ok() {
            let cache = guard.hash() * 10 + guard.dir as usize;

            if seen.contains(&cache) {
                p2 += 1;
                break;
            }
            seen.insert(cache);
        }

        grid[y][x] = cell;
    }

    (path.len(), p2)
}
