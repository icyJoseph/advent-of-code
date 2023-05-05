#[derive(Debug)]
enum Step {
    Up(isize),
    Down(isize),
    Left(isize),
    Right(isize),
}

impl Step {
    fn get_distance(&self) -> isize {
        match self {
            Step::Up(n) => *n,
            Step::Right(n) => *n,
            Step::Down(n) => *n,
            Step::Left(n) => *n,
        }
    }
}

#[derive(Debug)]
struct Section {
    x: isize,
    y: isize,
}

impl Section {
    fn new() -> Section {
        Section { x: 0, y: 0 }
    }

    fn get_coords(&self) -> (isize, isize) {
        (self.x, self.y)
    }

    fn is_touching(&mut self, rhs: (isize, isize)) -> bool {
        let (rhsx, rhsy) = rhs;
        for dx in -1..=1 {
            for dy in -1..=1 {
                if self.x + dx == rhsx && self.y + dy == rhsy {
                    return true;
                }
            }
        }

        false
    }

    fn touch(&mut self, target: (isize, isize)) {
        let (tx, ty) = target;

        if self.is_touching(target) {
            return;
        }

        let x_diff = tx - self.x;
        let y_diff = ty - self.y;

        let dx = if x_diff == 0 {
            x_diff
        } else {
            x_diff / x_diff.abs()
        };

        let dy = if y_diff == 0 {
            y_diff
        } else {
            y_diff / y_diff.abs()
        };

        self.x += dx;
        self.y += dy;
    }

    fn move_by(&mut self, delta: (isize, isize)) {
        let (dx, dy) = delta;

        self.x += dx;
        self.y += dy;
    }

    fn to_key(&self) -> String {
        format!("{:?}.{:?}", self.x, self.y)
    }
}

#[aoc2022::main(09)]
fn main(input: &str) -> (usize, usize) {
    let steps = input
        .lines()
        .map(|row| {
            let mut iter = row.split_whitespace();
            let dir = iter.next();
            let len = match iter.next() {
                Some(d) => d.parse::<isize>().ok(),
                _ => panic!("No length in instruction"),
            };

            match (dir, len) {
                (Some("U"), Some(s)) => Step::Up(s),
                (Some("D"), Some(s)) => Step::Down(s),
                (Some("L"), Some(s)) => Step::Left(s),
                (Some("R"), Some(s)) => Step::Right(s),
                _ => panic!("Unexpected instruction pair"),
            }
        })
        .collect::<Vec<_>>();

    let mut head = Section::new();

    use std::collections::HashSet;

    let mut visited: HashSet<String> = HashSet::new();

    let mut tail = Section::new();
    visited.insert(tail.to_key());

    for step in steps.iter() {
        let dist = step.get_distance();

        for _ in 0..dist {
            match step {
                Step::Up(_) => {
                    head.move_by((0, 1));
                }
                Step::Right(_) => {
                    head.move_by((1, 0));
                }
                Step::Down(_) => {
                    head.move_by((0, -1));
                }
                Step::Left(_) => {
                    head.move_by((-1, 0));
                }
            }

            tail.touch(head.get_coords());
            visited.insert(tail.to_key());
        }
    }

    let part_one = visited.len();

    let mut long_rope: Vec<Section> = (0..10).map(|_| Section::new()).collect();
    let mut visited: HashSet<String> = HashSet::new();
    visited.insert(long_rope[9].to_key());

    for step in steps.iter() {
        let dist = step.get_distance();

        for _ in 0..dist {
            match step {
                Step::Up(_) => {
                    long_rope[0].move_by((0, 1));
                }
                Step::Right(_) => {
                    long_rope[0].move_by((1, 0));
                }
                Step::Down(_) => {
                    long_rope[0].move_by((0, -1));
                }
                Step::Left(_) => {
                    long_rope[0].move_by((-1, 0));
                }
            }

            for i in 1..10 {
                let before = long_rope[i - 1].get_coords();
                long_rope[i].touch(before);
            }

            visited.insert(long_rope[9].to_key());
        }
    }

    let part_two = visited.len();

    (part_one, part_two)
}
