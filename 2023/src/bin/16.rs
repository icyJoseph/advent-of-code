use std::collections::HashSet;

#[derive(Clone, Copy)]
enum Dir {
    Up = 1,
    Down,
    Left,
    Right,
}

#[derive(Clone, Copy)]
struct Beam {
    // (x, y)
    head: (usize, usize),
    dir: Dir,
}

impl Beam {
    fn new(head: (usize, usize), dir: Dir) -> Self {
        Beam { head, dir }
    }

    fn move_on(&mut self) -> &mut Self {
        match self.dir {
            Dir::Left => self.head.0 = self.head.0.saturating_sub(1),
            Dir::Right => self.head.0 += 1,
            Dir::Up => self.head.1 = self.head.1.saturating_sub(1),
            Dir::Down => self.head.1 += 1,
        }

        self
    }

    fn rotate_clockwise(&mut self) -> &mut Self {
        let next_dir = match self.dir {
            Dir::Left => Dir::Up,
            Dir::Right => Dir::Down,
            Dir::Up => Dir::Right,
            Dir::Down => Dir::Left,
        };

        self.dir = next_dir;

        self.move_on()
    }
    fn rotate_counter_clockwise(&mut self) -> &mut Self {
        let next_dir = match self.dir {
            Dir::Left => Dir::Down,
            Dir::Right => Dir::Up,
            Dir::Up => Dir::Left,
            Dir::Down => Dir::Right,
        };

        self.dir = next_dir;

        self.move_on()
    }

    fn hash(&self) -> usize {
        1_000_000 * (self.dir as usize) + self.head.1 * 1_000 + self.head.0
    }
}

struct Grid(Vec<Vec<char>>, usize, usize);

impl Grid {
    fn new(input: &str) -> Self {
        let grid = Vec::from_iter(input.lines().map(|r| r.chars().collect::<Vec<_>>()));
        let width = grid[0].len();
        let height = grid.len();

        Grid(grid, width, height)
    }

    fn normal_coord(&self, position: (usize, usize)) -> usize {
        position.0 + self.1 * position.1
    }

    fn in_bounds(&self, position: (usize, usize)) -> bool {
        let width = self.1;
        let height = self.2;

        position.0 < width && position.1 < height
    }

    fn move_beam(&self, beam: &mut Beam) -> Option<Beam> {
        let Some(row) = &self.0.get(beam.head.1) else {
            return None;
        };

        let tile = row.get(beam.head.0)?;

        let mut new_beam = None;

        match tile {
            '.' => {
                beam.move_on();
            }
            '/' => match beam.dir {
                Dir::Left | Dir::Right => {
                    beam.rotate_counter_clockwise();
                }
                Dir::Up | Dir::Down => {
                    beam.rotate_clockwise();
                }
            },
            '\\' => match beam.dir {
                Dir::Left | Dir::Right => {
                    beam.rotate_clockwise();
                }
                Dir::Up | Dir::Down => {
                    beam.rotate_counter_clockwise();
                }
            },
            '-' => match beam.dir {
                Dir::Left | Dir::Right => {
                    beam.move_on();
                }
                Dir::Up | Dir::Down => {
                    let mut split_beam = *beam;
                    beam.rotate_clockwise();

                    split_beam.rotate_counter_clockwise();

                    new_beam = Some(split_beam);
                }
            },
            '|' => match beam.dir {
                Dir::Left | Dir::Right => {
                    let mut split_beam = *beam;
                    beam.rotate_clockwise();

                    split_beam.rotate_counter_clockwise();

                    new_beam = Some(split_beam);
                }
                Dir::Up | Dir::Down => {
                    beam.move_on();
                }
            },
            _ => {
                panic!("Unexpected grid element")
            }
        }

        new_beam
    }

    fn beam_stream(&self, start: &Beam) -> usize {
        let mut touched: HashSet<usize> = HashSet::new();
        let mut seen: HashSet<usize> = HashSet::new();

        let mut beams = vec![*start];

        touched.insert(self.normal_coord(beams[0].head));

        loop {
            if beams.is_empty() {
                break;
            }

            let mut acc = Vec::new();

            for beam in beams.iter_mut() {
                if seen.contains(&beam.hash()) {
                    continue;
                }

                seen.insert(beam.hash());

                if self.in_bounds(beam.head) {
                    touched.insert(self.normal_coord(beam.head));
                }

                if let Some(new_beam) = self.move_beam(beam) {
                    acc.push(new_beam);
                }

                acc.push(*beam);
            }

            beams = acc;
        }

        touched.len()
    }
}

#[aoc2023::main(16)]
fn main(input: &str) -> (usize, usize) {
    let grid = Grid::new(input);

    let start = Beam::new((0, 0), Dir::Right);

    let part_one = grid.beam_stream(&start);

    let part_two = (0..grid.1)
        .flat_map(|c| {
            [
                Beam::new((c, 0), Dir::Down),
                // grid is a square
                Beam::new((c, grid.2 - 1), Dir::Up),
                Beam::new((0, c), Dir::Left),
                Beam::new((grid.1 - 1, c), Dir::Right),
            ]
        })
        .map(|start| grid.beam_stream(&start))
        .max()
        .unwrap_or(0);

    (part_one, part_two)
}
