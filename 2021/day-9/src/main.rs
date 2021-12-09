use aoc;

fn solve(raw: String) -> () {
    let rows = raw.trim().split("\n").collect::<Vec<&str>>();

    let height = rows.len();
    let width = rows[0].len();

    let grid = rows
        .iter()
        .flat_map(|row| {
            row.split("")
                .filter(|x| !x.is_empty())
                .map(|c| parse_num::<usize>(c))
        })
        .collect::<Vec<usize>>();

    let adj = calc_adj(height, width);

    let mut basins_origins: Vec<usize> = vec![];

    for (index, value) in grid.iter().enumerate() {
        if adj[index].iter().map(|&m| grid[m]).all(|m| m > *value) {
            basins_origins.push(index);
        }
    }

    println!(
        "Part One: {}",
        basins_origins
            .iter()
            .map(|&origin| grid[origin] + 1)
            .sum::<usize>()
    );

    let mut basin_sizes: Vec<usize> = vec![];

    for origin in basins_origins.iter() {
        let distances = bfs(&adj, height, width, *origin, &grid);
        let size = distances.iter().filter(|&x| *x > 0).count() + 1;

        basin_sizes.push(size);
    }

    basin_sizes.sort_by(|a, b| b.cmp(&a));

    println!(
        "Part Two: {}",
        basin_sizes[..3].iter().fold(1, |prev, curr| prev * curr)
    );
}

fn main() {
    let input = aoc::get_input(2021, 9);

    // let input = std::fs::read_to_string("").expect("Error reading input");

    solve(input);
}

// Utilities
#[allow(dead_code)]
fn normal(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

#[allow(dead_code)]
fn rev_normal(norm: usize, width: usize) -> (usize, usize) {
    (norm % width, norm / width)
}

#[allow(dead_code)]
fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}
#[allow(dead_code)]
fn to_int(bin: &str) -> u32 {
    match u32::from_str_radix(bin, 2) {
        Ok(n) => n,
        _ => panic!("Error parsing binary to integer"),
    }
}

#[allow(dead_code)]
fn string_vec<T: std::string::ToString>(vec: &Vec<T>, separator: &str) -> String {
    vec.iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
        .join(separator)
}

type Adj = Vec<Vec<usize>>;

fn norm(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

fn calc_adj(height: usize, width: usize) -> Adj {
    let mut adj = vec![vec![]; height * width];

    for y in 0..height {
        for x in 0..width {
            let index = norm(x, y, width);
            if x > 0 {
                adj[index].push(norm(x - 1, y, width));
            }
            if y + 1 < height {
                adj[index].push(norm(x, y + 1, width));
            }
            if x + 1 < width {
                adj[index].push(norm(x + 1, y, width));
            }
            if y > 0 {
                adj[index].push(norm(x, y - 1, width));
            }
        }
    }

    adj
}

fn bfs(adj: &Adj, height: usize, width: usize, root: usize, nodes: &Vec<usize>) -> Vec<usize> {
    let mut distances = vec![0; height * width];

    let mut visited = vec![false; height * width];

    use std::collections::VecDeque;
    let mut q = VecDeque::new();

    visited[root] = true;

    q.push_back(root);
    // distance to self is zero
    distances[root] = 0;

    loop {
        let next = q.pop_front();

        match next {
            None => {
                break;
            }
            Some(elem) => {
                for &vec in adj[elem].iter() {
                    if visited[vec] {
                        continue;
                    }

                    visited[vec] = true;

                    if nodes[vec] == 9usize {
                        continue;
                    }

                    distances[vec] = distances[elem] + 1;
                    q.push_back(vec);
                }
            }
        }
    }

    distances
}
