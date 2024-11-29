#[derive(Debug)]
enum Dir {
    Up,
    Down,
    Right,
    Left,
}

impl Dir {
    fn from_char(ch: Option<&str>) -> Self {
        match ch {
            Some("U") => Dir::Up,
            Some("D") => Dir::Down,
            Some("L") => Dir::Left,
            Some("R") => Dir::Right,
            _ => panic!("Invalid {ch:?}"),
        }
    }
}

#[derive(Debug)]
struct Move {
    dir: Dir,
    steps: i64,
}

impl Move {
    fn from_input(line: &str) -> Self {
        let mut spec = line.split_whitespace();
        let dir = Dir::from_char(spec.next());
        let Some(steps) = spec.next() else {
            panic!("No steps spec")
        };

        let Ok(steps) = steps.parse::<i64>() else {
            panic!("Invalid steps")
        };

        Move { dir, steps }
    }

    fn from_hex_input(line: &str) -> Self {
        let mut spec = line.split_whitespace();
        spec.next(); // old dir instruction
        spec.next(); // old steps instruction

        let Some(spec_hex) = spec.next() else {
            panic!("No hex spec")
        };

        let mut hex_chars = spec_hex.chars().skip(2); // (#

        let hex = &hex_chars.by_ref().take(5).collect::<String>();

        let Ok(steps) = i64::from_str_radix(hex, 16) else {
            panic!("Invalid hex steps")
        };

        let spec_dir = hex_chars.next();

        let dir = match spec_dir {
            Some('0') => Dir::Right,
            Some('1') => Dir::Down,
            Some('2') => Dir::Left,
            Some('3') => Dir::Up,
            _ => panic!("invalid dir"),
        };

        Move { dir, steps }
    }
}
#[derive(Debug)]
struct Corner {
    x: i64,
    y: i64,
}

impl Corner {
    fn new(x: i64, y: i64) -> Self {
        Self { x, y }
    }

    fn from_move(inst: &Move, last: &Self) -> Self {
        let (x, y) = match inst.dir {
            Dir::Up => (last.x, last.y - inst.steps),
            Dir::Down => (last.x, last.y + inst.steps),
            Dir::Right => (last.x + inst.steps, last.y),
            Dir::Left => (last.x - inst.steps, last.y),
        };

        Self { x, y }
    }
}

fn calc_area(moves: &[Move]) -> i64 {
    let first_corner = Corner::new(0, 0);
    let mut corners = vec![first_corner];

    let mut perimeter = 0;

    for inst in moves {
        let next_corner = Corner::from_move(inst, &corners[corners.len() - 1]);

        corners.push(next_corner);
        perimeter += inst.steps;
    }

    let segments = corners.windows(2);

    let inner_area = segments
        .map(|line| (line[0].x - line[1].x) * (line[1].y + line[0].y))
        .sum::<i64>()
        / 2;

    inner_area + perimeter / 2 + 1 // initial cube
}

#[aoc2023::main(18)]
fn main(input: &str) -> (i64, i64) {
    let moves = input.lines().map(Move::from_input).collect::<Vec<_>>();

    let part_one = calc_area(&moves);

    let long_moves = input.lines().map(Move::from_hex_input).collect::<Vec<_>>();

    let part_two = calc_area(&long_moves);

    (part_one, part_two)
}
