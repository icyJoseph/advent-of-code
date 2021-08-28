use aoc;
use std::cell::Cell;

#[derive(Debug)]
struct Point {
    x: usize,
    y: usize,
}

#[derive(Debug)]
struct Element {
    symbol: char,
    x: usize,
    y: usize,
    up: Option<Point>,
    left: Option<Point>,
    right: Option<Point>,
    down: Option<Point>,
}

#[derive(Debug, Copy, Clone)]
enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT,
}

#[derive(Debug, Clone)]
struct Cart {
    x: Cell<usize>,
    y: Cell<usize>,
    heading: Cell<Direction>,
    intersections: Cell<usize>,
    crashed: Cell<bool>,
}

enum Turn {
    LEFT,
    RIGHT,
    STRAIGHT,
}

impl Direction {
    fn turn(self, turn: Turn) -> Direction {
        match self {
            Direction::UP => match turn {
                Turn::LEFT => Direction::LEFT,
                Turn::RIGHT => Direction::RIGHT,
                Turn::STRAIGHT => Direction::UP,
            },

            Direction::DOWN => match turn {
                Turn::LEFT => Direction::RIGHT,
                Turn::RIGHT => Direction::LEFT,
                Turn::STRAIGHT => Direction::DOWN,
            },

            Direction::LEFT => match turn {
                Turn::LEFT => Direction::DOWN,
                Turn::RIGHT => Direction::UP,
                Turn::STRAIGHT => Direction::LEFT,
            },

            Direction::RIGHT => match turn {
                Turn::LEFT => Direction::UP,
                Turn::RIGHT => Direction::DOWN,
                Turn::STRAIGHT => Direction::RIGHT,
            },
        }
    }
}

impl Cart {
    fn new(x: usize, y: usize, heading: Direction) -> Self {
        Cart {
            x: Cell::new(x),
            y: Cell::new(y),
            heading: Cell::new(heading),
            intersections: Cell::new(0),
            crashed: Cell::new(false),
        }
    }

    fn mov(&mut self, grid: &Vec<Vec<Element>>) -> () {
        let x = self.x.get();
        let y = self.y.get();
        let current_heading = self.heading.get();
        let intersections = self.intersections.get();

        match grid[y][x].symbol {
            '+' => {
                let heading = match intersections {
                    0 => current_heading.turn(Turn::LEFT),
                    1 => current_heading.turn(Turn::STRAIGHT),
                    2 => current_heading.turn(Turn::RIGHT),

                    _ => panic!("Intersections went over 2"),
                };

                match heading {
                    Direction::UP => self.y.set(y - 1),
                    Direction::DOWN => self.y.set(y + 1),
                    Direction::LEFT => self.x.set(x - 1),
                    Direction::RIGHT => self.x.set(x + 1),
                }

                self.heading.set(heading);
                self.intersections.set((intersections + 1) % 3);
            }

            '|' => match current_heading {
                Direction::UP => self.y.set(y - 1),
                Direction::DOWN => self.y.set(y + 1),
                _ => panic!("Impossible heading on '|'"),
            },

            '-' => match current_heading {
                Direction::LEFT => self.x.set(x - 1),
                Direction::RIGHT => self.x.set(x + 1),
                _ => panic!("Impossible heading on '-'"),
            },

            '/' => match current_heading {
                Direction::UP => {
                    self.heading.set(Direction::RIGHT);
                    self.x.set(x + 1);
                }
                Direction::DOWN => {
                    self.heading.set(Direction::LEFT);
                    self.x.set(x - 1);
                }
                Direction::LEFT => {
                    self.heading.set(Direction::DOWN);
                    self.y.set(y + 1);
                }
                Direction::RIGHT => {
                    self.heading.set(Direction::UP);
                    self.y.set(y - 1);
                }
            },

            '\\' => match current_heading {
                Direction::UP => {
                    self.heading.set(Direction::LEFT);
                    self.x.set(x - 1);
                }
                Direction::DOWN => {
                    self.heading.set(Direction::RIGHT);
                    self.x.set(x + 1);
                }
                Direction::LEFT => {
                    self.heading.set(Direction::UP);
                    self.y.set(y - 1);
                }
                Direction::RIGHT => {
                    self.heading.set(Direction::DOWN);
                    self.y.set(y + 1);
                }
            },

            _ => {}
        }
    }
}

fn norm(c: &char) -> char {
    match c {
        '<' | '>' => '-',
        '^' | 'v' => '|',
        any => *any,
    }
}

fn lex(c: &char, x: usize, y: usize, grid: &Vec<Vec<char>>) -> Element {
    let ch = norm(c);

    match ch {
        '+' => Element {
            symbol: '+',
            x,
            y,
            up: Some(Point { x, y: y - 1 }),
            down: Some(Point { x, y: y + 1 }),
            left: Some(Point { x: x - 1, y }),
            right: Some(Point { x: x + 1, y }),
        },

        '|' => Element {
            symbol: '|',
            x,
            y,
            up: Some(Point { x, y: y - 1 }),
            down: Some(Point { x, y: y + 1 }),
            left: None,
            right: None,
        },

        '-' => Element {
            symbol: '-',
            x,
            y,
            up: None,
            down: None,
            left: Some(Point { x: x - 1, y }),
            right: Some(Point { x: x + 1, y }),
        },

        '/' => {
            let r = match grid[y].get(x + 1) {
                Some(cell) if norm(cell) == '-' => Some('-'),
                Some(cell) if norm(cell) == '+' => Some('+'),
                _ => None,
            };

            let d = match grid.get(y + 1) {
                Some(r) => match r.get(x) {
                    Some(cell) if norm(cell) == '|' => Some('|'),
                    Some(cell) if norm(cell) == '+' => Some('+'),
                    _ => None,
                },
                None => None,
            };

            let u = if y > 0 {
                match grid.get(y - 1) {
                    Some(r) => match r.get(x) {
                        Some(cell) if norm(cell) == '|' => Some('|'),
                        Some(cell) if norm(cell) == '+' => Some('+'),
                        _ => None,
                    },
                    None => None,
                }
            } else {
                None
            };

            let l = if x > 0 {
                match grid[y].get(x - 1) {
                    Some(cell) if norm(cell) == '-' => Some('-'),
                    Some(cell) if norm(cell) == '+' => Some('+'),
                    _ => None,
                }
            } else {
                None
            };

            let mut left = None;
            let mut right = None;
            let mut up = None;
            let mut down = None;

            match (r, d) {
                (Some('+'), Some('|'))
                | (Some('-'), Some('+'))
                | (Some('-'), Some('|'))
                | (Some('+'), Some('+')) => {
                    right = Some(Point { x: x + 1, y });
                    down = Some(Point { x, y: y + 1 });
                }
                _ => match (l, u) {
                    (Some('+'), Some('|'))
                    | (Some('-'), Some('+'))
                    | (Some('-'), Some('|'))
                    | (Some('+'), Some('+')) => {
                        left = Some(Point { x: x - 1, y });
                        up = Some(Point { x, y: y - 1 });
                    }
                    _ => panic!(
                        "/ curve without connections. Up {:?}. Down {:?}. Left {:?}. Right {:?}",
                        u, d, l, r
                    ),
                },
            }

            Element {
                symbol: '/',
                x,
                y,
                up,
                down,
                left,
                right,
            }
        }

        '\\' => {
            let r = match grid[y].get(x + 1) {
                Some(cell) if norm(cell) == '-' => Some('-'),
                Some(cell) if norm(cell) == '+' => Some('+'),
                _ => None,
            };

            let u = if y > 0 {
                match grid.get(y - 1) {
                    Some(r) => match r.get(x) {
                        Some(cell) if norm(cell) == '|' => Some('|'),
                        Some(cell) if norm(cell) == '+' => Some('+'),
                        _ => None,
                    },
                    None => None,
                }
            } else {
                None
            };

            let d = match grid.get(y + 1) {
                Some(r) => match r.get(x) {
                    Some(cell) if norm(cell) == '|' => Some('|'),
                    Some(cell) if norm(cell) == '+' => Some('+'),
                    _ => None,
                },
                None => None,
            };

            let l = if x > 0 {
                match grid[y].get(x - 1) {
                    Some(cell) if norm(cell) == '-' => Some('-'),
                    Some(cell) if norm(cell) == '+' => Some('+'),
                    _ => None,
                }
            } else {
                None
            };

            let mut left = None;
            let mut right = None;
            let mut up = None;
            let mut down = None;

            match (r, u) {
                (Some('+'), Some('|'))
                | (Some('-'), Some('+'))
                | (Some('-'), Some('|'))
                | (Some('+'), Some('+')) => {
                    right = Some(Point { x: x + 1, y });
                    up = Some(Point { x, y: y - 1 });
                }
                _ => match (l, d) {
                    (Some('+'), Some('|'))
                    | (Some('-'), Some('+'))
                    | (Some('-'), Some('|'))
                    | (Some('+'), Some('+')) => {
                        left = Some(Point { x: x - 1, y });
                        down = Some(Point { x, y: y + 1 });
                    }
                    _ => panic!(
                        "\\ curve without connections. Up {:?}. Down {:?}. Left {:?}. Right {:?}",
                        u, d, l, r
                    ),
                },
            }

            Element {
                symbol: '\\',
                x,
                y,
                up,
                down,
                left,
                right,
            }
        }

        _ => Element {
            symbol: ' ',
            x,
            y,
            up: None,
            down: None,
            left: None,
            right: None,
        },
    }
}

#[allow(dead_code)]
fn print(grid: &Vec<Vec<Element>>, carts: &Vec<Cart>) -> () {
    let mut symbols = grid
        .iter()
        .map(|row| row.iter().map(|e| e.symbol).collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    for cart in carts {
        let next = match cart.heading.get() {
            Direction::UP => '^',
            Direction::DOWN => 'v',
            Direction::LEFT => '<',
            Direction::RIGHT => '>',
        };

        let y = cart.y.get();
        let x = cart.x.get();

        match symbols[y][x] {
            'v' => symbols[y][x] = 'x',
            '<' => symbols[y][x] = 'x',
            '>' => symbols[y][x] = 'x',
            '^' => symbols[y][x] = 'x',
            _ => symbols[y][x] = next,
        }
    }

    let mut plot = String::new();

    for row in symbols {
        plot.push_str(&format!("{}\n", row.iter().collect::<String>()));
    }

    println!("{}", plot);
}

fn solve(raw: String) -> () {
    let grid = raw
        .split("\n")
        .filter(|r| r.len() > 0)
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let width = grid[0].len();

    let mut game: Vec<Vec<Element>> = vec![];

    let mut carts = vec![];

    for (y, row) in grid.iter().enumerate() {
        let mut game_row: Vec<Element> = vec![];

        for (x, cell) in row.iter().enumerate() {
            let game_cell = lex(cell, x, y, &grid);
            game_row.push(game_cell);

            match cell {
                '<' => carts.push(Cart::new(x, y, Direction::LEFT)),
                '>' => carts.push(Cart::new(x, y, Direction::RIGHT)),
                'v' => carts.push(Cart::new(x, y, Direction::DOWN)),
                '^' => carts.push(Cart::new(x, y, Direction::UP)),
                _ => {}
            }
        }

        game.push(game_row);
    }

    let mut crashes = 0;

    let mut first_crash: Option<(usize, usize)> = None;

    let total = carts.len();

    let mut run = |carts: &mut Vec<Cart>| loop {
        carts.sort_by(|a, b| {
            let x_a = a.x.get();
            let y_a = a.y.get();

            let m_a = y_a * width + x_a;

            let x_b = b.x.get();
            let y_b = b.y.get();

            let m_b = y_b * width + x_b;

            m_a.cmp(&m_b)
        });

        for i in 0..carts.len() {
            let c = &mut carts[i];

            if c.crashed.get() {
                continue;
            }

            if total - crashes == 1 {
                return;
            }

            c.mov(&game);

            let crash_x = c.x.get();
            let crash_y = c.y.get();

            let mut crashed = carts
                .iter()
                .filter(|c| c.x.get() == crash_x && c.y.get() == crash_y && !c.crashed.get())
                .collect::<Vec<_>>();

            if crashed.len() > 1 {
                match first_crash {
                    None => {
                        first_crash = Some((crash_x, crash_y));
                    }
                    _ => {}
                }

                crashes += crashed.len();

                crashed.iter_mut().for_each(|cart| cart.crashed.set(true));
            }

            print(&game, &carts);
        }
    };

    run(&mut carts);

    match first_crash {
        Some((x, y)) => println!("Part 1: {},{}", x, y),
        None => panic!("There was no first crash"),
    }

    match carts.iter().find(|cart| !cart.crashed.get()) {
        Some(c) => println!("Part 2: {},{}", c.x.get(), c.y.get()),
        None => panic!("No car survived!"),
    }
}

fn main() {
    let input = aoc::get_input(2018, 13);

    solve(input);
}
