use aoc;

use std::io;
use std::io::prelude::*;

use std::cell::Cell;

fn pause() {
    let mut stdin = io::stdin();
    let mut stdout = io::stdout();

    write!(stdout, "Press enter to continue...").unwrap();
    stdout.flush().unwrap();

    let _ = stdin.read(&mut [0u8]).unwrap();
}

#[derive(Debug)]
struct Particle {
    x0: i32,
    y0: i32,
    x: Cell<i32>,
    y: Cell<i32>,
    dx: i32,
    dy: i32,
}

impl Particle {
    fn new(spec: &[i32]) -> Self {
        Particle {
            x0: spec[0],
            y0: spec[1],
            x: Cell::new(spec[0]),
            y: Cell::new(spec[1]),
            dx: spec[2],
            dy: spec[3],
        }
    }

    fn advance(&mut self) -> () {
        self.x.set(self.x.get() + self.dx);
        self.y.set(self.y.get() + self.dy);
    }
}

fn plot(vec: &Vec<Particle>) -> usize {
    let mut min_x = None;
    let mut min_y = None;
    let mut max_x = None;
    let mut max_y = None;

    for v in vec {
        match min_x {
            None => min_x = Some(v.x.get()),
            Some(n) if v.x.get() < n => {
                min_x = Some(v.x.get());
            }
            _ => {}
        }

        match max_x {
            None => max_x = Some(v.x.get()),
            Some(n) if v.x.get() > n => {
                max_x = Some(v.x.get());
            }
            _ => {}
        }

        match min_y {
            None => min_y = Some(v.y.get()),
            Some(n) if v.y.get() < n => {
                min_y = Some(v.y.get());
            }
            _ => {}
        }

        match max_y {
            None => max_y = Some(v.y.get()),
            Some(n) if v.y.get() > n => {
                max_y = Some(v.y.get());
            }
            _ => {}
        }
    }

    match (min_x, max_x, min_y, max_y) {
        (Some(x), Some(m_x), Some(y), Some(m_y)) => {
            let x_offset = x;
            let y_offset = y;

            let width = (m_x - x) as usize + 1;
            let height = (m_y - y) as usize + 1;

            if width > 100 {
                return width * height;
            }

            let mut grid = vec![vec!["."; width]; height];

            for v in vec {
                grid[(v.y.get() - y_offset) as usize][(v.x.get() - x_offset) as usize] = "#";
            }

            let mut result = String::new();

            for y in 0..height {
                result.push_str(&format!("{}\n", grid[y].join("")));
            }

            println!("================");

            println!("Part 1?: \n{}", result);

            width * height
        }
        _ => panic!("Missing grid bounds"),
    }
}

fn solve(raw: String) -> () {
    let input = raw.trim();

    println!("{}", input);

    let mut vectors = input
        .split("\n")
        .map(|x| {
            x.replace("position=<", "")
                .replace("velocity=<", ",")
                .replace(">", "")
                .replace(" ", "")
        })
        .map(|x| {
            x.split(",")
                .map(|y| y.trim().parse::<i32>().unwrap())
                .collect::<Vec<i32>>()
        })
        .map(|v| Particle::new(&v[0..4]))
        .collect::<Vec<Particle>>();

    let mut prev_area = None;

    let mut seconds = 0;

    loop {
        let area = plot(&vectors);

        println!("Part 2: {} seconds", seconds);

        println!("Area: {} units^2", area);

        match prev_area {
            Some(p) if p < area => {
                break;
            }
            _ => prev_area = Some(area),
        }

        if area < 3000 {
            pause();
        }

        for v in vectors.iter_mut() {
            v.advance();
        }
        seconds += 1;
    }
}

fn main() {
    let input = "position=< 9,  1> velocity=< 0,  2>
position=< 7,  0> velocity=<-1,  0>
position=< 3, -2> velocity=<-1,  1>
position=< 6, 10> velocity=<-2, -1>
position=< 2, -4> velocity=< 2,  2>
position=<-6, 10> velocity=< 2, -2>
position=< 1,  8> velocity=< 1, -1>
position=< 1,  7> velocity=< 1,  0>
position=<-3, 11> velocity=< 1, -2>
position=< 7,  6> velocity=<-1, -1>
position=<-2,  3> velocity=< 1,  0>
position=<-4,  3> velocity=< 2,  0>
position=<10, -3> velocity=<-1,  1>
position=< 5, 11> velocity=< 1, -2>
position=< 4,  7> velocity=< 0, -1>
position=< 8, -2> velocity=< 0,  1>
position=<15,  0> velocity=<-2,  0>
position=< 1,  6> velocity=< 1,  0>
position=< 8,  9> velocity=< 0, -1>
position=< 3,  3> velocity=<-1,  1>
position=< 0,  5> velocity=< 0, -1>
position=<-2,  2> velocity=< 2,  0>
position=< 5, -2> velocity=< 1,  2>
position=< 1,  4> velocity=< 2,  1>
position=<-2,  7> velocity=< 2, -2>
position=< 3,  6> velocity=<-1, -1>
position=< 5,  0> velocity=< 1,  0>
position=<-6,  0> velocity=< 2,  0>
position=< 5,  9> velocity=< 1, -2>
position=<14,  7> velocity=<-2,  0>
position=<-3,  6> velocity=< 2, -1>
"
    .to_string();
    let input = aoc::get_input(2018, 10);
    solve(input);
}
