#[derive(Clone, Debug, Copy)]
enum Dir {
    Up,
    Down,
    Left,
    Right,
}

impl std::fmt::Display for Dir {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

#[derive(Debug, Clone, Copy)]
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
        // println!("{self:?}");
        match self.dir {
            Dir::Left => self.head.0 = self.head.0.saturating_sub(1),
            Dir::Right => self.head.0 += 1,
            Dir::Up => self.head.1 = self.head.1.saturating_sub(1),
            Dir::Down => self.head.1 += 1,
        }
        // println!("{self:?}");

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

    fn split(&self) -> Self {
        Beam {
            head: self.head,
            dir: self.dir,
        }
    }

    fn hash(&self) -> String {
        format!("{}::{}::{}", self.head.0, self.head.1, self.dir)
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

    fn beam(&self, beam: &mut Beam) -> Option<Beam> {
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
                    let mut split_beam = beam.split();
                    beam.rotate_clockwise();

                    split_beam.rotate_counter_clockwise();

                    new_beam = Some(split_beam);
                }
            },
            '|' => match beam.dir {
                Dir::Left | Dir::Right => {
                    let mut split_beam = beam.split();
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
}

#[aoc2023::main(16)]
fn main(input: &str) -> (usize, usize) {
    let grid = Grid::new(input);

    use std::collections::HashSet;

    let mut touched: HashSet<usize> = HashSet::new();
    let mut seen: HashSet<String> = HashSet::new();

    let mut beams = vec![Beam::new((0, 0), Dir::Right)];

    touched.insert(grid.normal_coord(beams[0].head));

    loop {
        if beams.is_empty() {
            break;
        }

        let mut acc = vec![];

        for beam in beams.iter_mut() {
            if seen.contains(&beam.hash()) {
                continue;
            }

            seen.insert(beam.hash());

            if grid.in_bounds(beam.head) {
                touched.insert(grid.normal_coord(beam.head));
            }

            if let Some(new_beam) = grid.beam(beam) {
                acc.push(new_beam);
            }

            acc.push(*beam);
        }

        beams = acc;
    }

    for beam in beams.iter() {
        if grid.in_bounds(beam.head) {
            touched.insert(grid.normal_coord(beam.head));
        }
    }

    (touched.len(), 0)
}
