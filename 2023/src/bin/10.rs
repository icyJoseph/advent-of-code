use std::collections::{HashSet, VecDeque};

type Point = (usize, usize);

#[aoc2023::main(10)]
fn main(input: &str) -> (usize, usize) {
    let mut grid: Vec<Vec<(char, Point)>> = vec![];

    let mut start: Point = (0, 0);

    for (y, line) in input.lines().enumerate() {
        let mut chunk: [Vec<(char, Point)>; 3] = [vec![], vec![], vec![]];

        for (x, ch) in line.chars().enumerate() {
            let center: Point = (3 * x + 1, 3 * y + 1);

            let template = match ch {
                '|' => VERTICAL,
                '-' => HORIZONTAL,
                'L' => NE,
                'J' => NW,
                '7' => SW,
                'F' => SE,
                '.' => GROUND,
                'S' => START,
                _ => {
                    panic!("Rust wants to panic")
                }
            };
            for (dy, row) in template.iter().enumerate() {
                for point in row {
                    chunk[dy].push((*point, center))
                }
            }

            if ch == 'S' {
                start = center
            }
        }

        grid.extend(chunk);
    }

    let width = grid[0].len();
    let height = grid.len();

    let adj = calc_adj(height, width);

    let flat_grid = grid
        .iter()
        .flatten()
        .map(|&(ch, (x, y))| (ch, normal(x, y, width)))
        .collect::<Vec<(char, usize)>>();

    let root = normal(start.0, start.1, width);

    let distance = walk_loop(root, &adj, &flat_grid, width * height);

    let Some(&max_distance) = distance.iter().max() else {
        panic!("No max distance")
    };

    let outside = bfs_outside(0, &adj, &flat_grid);

    (max_distance / 3, (width / 3) * (height / 3) - outside.len())
}

type Adj = Vec<Vec<usize>>;

fn normal(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

fn calc_adj(height: usize, width: usize) -> Adj {
    let mut adj = vec![vec![]; height * width];

    for y in 0..height {
        for x in 0..width {
            let index = normal(x, y, width);
            if x > 0 {
                adj[index].push(normal(x - 1, y, width));
            }
            if y + 1 < height {
                adj[index].push(normal(x, y + 1, width));
            }
            if x + 1 < width {
                adj[index].push(normal(x + 1, y, width));
            }
            if y > 0 {
                adj[index].push(normal(x, y - 1, width));
            }
        }
    }

    adj
}

fn walk_loop(root: usize, adj: &Adj, graph: &[(char, usize)], size: usize) -> Vec<usize> {
    let mut distances = vec![0; size];

    let mut visited = vec![false; size];

    let mut q = VecDeque::new();

    visited[root] = true;

    q.push_back(root);

    distances[root] = 0;

    while let Some(elem) = q.pop_front() {
        for &vec in adj[elem].iter() {
            if visited[vec] {
                continue;
            }

            if graph[vec].0 == '.' {
                distances[vec] = distances[elem] + 1;
                visited[vec] = true;

                q.push_back(vec);
            }
        }
    }

    distances
}

fn bfs_outside(root: usize, adj: &Adj, graph: &[(char, usize)]) -> HashSet<usize> {
    let mut outside = HashSet::new();
    let mut visited = HashSet::new();

    let mut q = VecDeque::new();

    visited.insert(root);

    q.push_back(root);

    while let Some(elem) = q.pop_front() {
        for &vec in adj[elem].iter() {
            if visited.contains(&vec) {
                continue;
            }

            visited.insert(vec);

            outside.insert(graph[vec].1);

            if graph[vec].0 == '.' {
                continue;
            }

            q.push_back(vec);
        }
    }

    outside
}

type Template = [[char; 3]; 3];

const VERTICAL: Template = [
    ['#', '.', '#'], // |
    ['#', '.', '#'],
    ['#', '.', '#'],
];

const HORIZONTAL: Template = [
    ['#', '#', '#'], // -
    ['.', '.', '.'],
    ['#', '#', '#'],
];

const NE: Template = [
    ['#', '.', '#'], // L
    ['#', '.', '.'],
    ['#', '#', '#'],
];

const NW: Template = [
    ['#', '.', '#'], // J
    ['.', '.', '#'],
    ['#', '#', '#'],
];

const SW: Template = [
    ['#', '#', '#'], // 7
    ['.', '.', '#'],
    ['#', '.', '#'],
];

const SE: Template = [
    ['#', '#', '#'], // F
    ['#', '.', '.'],
    ['#', '.', '#'],
];

const GROUND: Template = [
    ['#', '#', '#'], // .
    ['#', '#', '#'],
    ['#', '#', '#'],
];

const START: Template = [
    ['#', '.', '#'], // S
    ['.', '.', '.'],
    ['#', '.', '#'],
];
