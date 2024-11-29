use std::cmp::{Ordering, Reverse};

use std::collections::{BinaryHeap, HashMap};

#[derive(PartialEq, Copy, Clone)]
enum Dir {
    Up = 1,
    Right,
    Down,
    Left,
}

impl Dir {
    fn is_opposite(&self, other: &Dir) -> bool {
        let opposite = match self {
            Dir::Up => Dir::Down,
            Dir::Down => Dir::Up,
            Dir::Right => Dir::Left,
            Dir::Left => Dir::Right,
        };

        opposite == *other
    }
}

#[derive(Eq, PartialEq)]
struct Point {
    x: usize,
    y: usize,
}

impl Point {
    fn new(x: usize, y: usize) -> Self {
        Point { x, y }
    }

    fn magnitude(&self) -> usize {
        self.x + self.y
    }

    fn step(&self, dir: &Dir) -> Self {
        match dir {
            Dir::Up => Point::new(self.x, self.y.overflowing_sub(1).0),
            Dir::Down => Point::new(self.x, self.y + 1),
            Dir::Right => Point::new(self.x + 1, self.y),
            Dir::Left => Point::new(self.x.overflowing_sub(1).0, self.y),
        }
    }
}

struct Move {
    position: Point,
    score: usize,
    dir: Dir,
    steps: usize,
}

impl Move {
    fn new(x: usize, y: usize, dir: Dir) -> Self {
        Move {
            position: Point::new(x, y),
            score: 0,
            dir,
            steps: 0,
        }
    }
    fn from(x: usize, y: usize, dir: Dir, score: usize, steps: usize) -> Self {
        Move {
            position: Point::new(x, y),
            score,
            dir,
            steps,
        }
    }

    fn rank(&self) -> usize {
        self.position.magnitude() + self.score
    }

    fn hash(&self) -> usize {
        let dir = self.dir as usize;

        self.position.y * 10_000_000 + self.position.x * 10_000 + self.steps * 10 + dir
    }
}

impl Ord for Move {
    fn cmp(&self, other: &Self) -> Ordering {
        self.rank().cmp(&other.rank())
    }
}

impl PartialOrd for Move {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl PartialEq for Move {
    fn eq(&self, other: &Self) -> bool {
        self.rank() == other.rank()
    }
}

impl Eq for Move {}

fn search<F>(end: &Point, grid: &[Vec<usize>], step_rule: F) -> usize
where
    F: (Fn(usize, usize) -> bool),
{
    let mut q: BinaryHeap<Reverse<Move>> = BinaryHeap::new();

    let mut visited: HashMap<usize, usize> = HashMap::new();

    q.push(Reverse(Move::new(0, 0, Dir::Down)));
    q.push(Reverse(Move::new(0, 0, Dir::Right)));

    loop {
        let Some(Reverse(current_node)) = q.pop() else {
            break;
        };

        if current_node.position == *end && step_rule(current_node.steps, current_node.steps) {
            return current_node.score;
        }

        [Dir::Down, Dir::Left, Dir::Up, Dir::Right]
            .iter()
            .for_each(|dir| {
                if current_node.dir.is_opposite(dir) {
                    return;
                }

                let steps = if dir == &current_node.dir {
                    current_node.steps + 1
                } else {
                    1
                };

                if !step_rule(current_node.steps, steps) {
                    return;
                }

                let next_point = current_node.position.step(dir);

                let Some(row) = grid.get(next_point.y) else {
                    return;
                };

                let Some(&value) = row.get(next_point.x) else {
                    return;
                };

                let next_score = current_node.score + value;
                let next_move = Move::from(next_point.x, next_point.y, *dir, next_score, steps);
                let key = next_move.hash();

                let current_score = visited.entry(key).or_insert(usize::MAX);

                if *current_score <= next_move.score {
                    return;
                }

                visited.insert(key, next_score);

                q.push(Reverse(next_move));
            })
    }

    0
}

#[aoc2023::main(17)]
fn main(input: &str) -> (usize, usize) {
    let grid = input
        .lines()
        .map(|line| {
            line.chars()
                .filter_map(|c| c.to_digit(10))
                .map(|c| c as usize)
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();

    let width = grid[0].len();
    let height = grid.len();

    let end = Point::new(width - 1, height - 1);

    let part_one = search(&end, &grid, |_, current| current <= 3);
    let part_two = search(&end, &grid, |prev, current| {
        (current > prev || prev >= 4) && current < 11
    });

    (part_one, part_two)
}
