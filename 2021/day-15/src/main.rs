use aoc;

fn solve(raw: String) -> () {
    let rows = raw.trim().split("\n").collect::<Vec<&str>>();

    let height = rows.len();
    let width = rows[0].len();

    let grid = rows
        .iter()
        .flat_map(|row| {
            row.chars()
                .map(|c| c.to_string())
                .map(|c| parse_num::<usize>(&c))
        })
        .collect::<Vec<usize>>();

    let adj = calc_adj(height, width);

    let start = 0;
    let end = normal(width - 1, height - 1, width);

    println!("Part One: {}", bfs(start, &adj, &grid, width * height)[end]);

    let factor = 5usize;

    let mega_grid = create_extended_grid(raw, width, height, factor);
    let mega_width = width * factor;
    let mega_height = height * factor;
    let mega_adj = calc_adj(mega_height, mega_width);
    let mega_end = normal(mega_width - 1, mega_height - 1, mega_width);

    println!(
        "Part Two: {}",
        bfs(start, &mega_adj, &mega_grid, mega_width * mega_height)[mega_end]
    );
}

fn main() {
    let input = aoc::get_input(2021, 15);

    // let input = std::fs::read_to_string("").expect("Error reading input");

    solve(input);
}

// Utilities

type Adj = Vec<Vec<usize>>;

fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}

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

fn bfs(root: usize, adj: &Adj, nodes: &Vec<usize>, size: usize) -> Vec<usize> {
    let mut risks = vec![usize::MAX; size];

    let mut visited = vec![false; size];

    use std::collections::VecDeque;
    let mut q = VecDeque::new();

    visited[root] = true;

    q.push_back(root);

    risks[root] = 0;

    loop {
        let current = q.pop_front();

        match current {
            None => {
                break;
            }
            Some(elem) => {
                for &vec in adj[elem].iter() {
                    let new_risk = risks[elem] + nodes[vec];

                    if new_risk < risks[vec] {
                        risks[vec] = new_risk;
                        visited[vec] = true;
                        q.push_back(vec);
                    }

                    if visited[vec] {
                        continue;
                    }
                }
            }
        }
    }

    risks
}

fn create_extended_grid(raw: String, width: usize, height: usize, factor: usize) -> Vec<usize> {
    let base_grid = raw
        .trim()
        .split("\n")
        .flat_map(|row| {
            row.chars()
                .map(|c| c.to_string())
                .map(|c| parse_num::<usize>(&c))
        })
        .collect::<Vec<usize>>();

    let mut grid: Vec<usize> = vec![0; factor * width * factor * height];

    for h in 0..factor * height {
        for w in 0..factor * width {
            let x = w % width;
            let y = h % height;
            let mut value = h / height + w / width + base_grid[normal(x, y, width)];

            while value > 9 {
                value = value - 9;
            }

            grid[normal(w, h, factor * width)] = value;
        }
    }

    grid
}
