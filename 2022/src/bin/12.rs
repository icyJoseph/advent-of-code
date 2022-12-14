use std::collections::VecDeque;

#[aoc2022::main(12)]
fn main(input: &str) -> (usize, usize) {
    let rows = input
        .split('\n')
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let width = rows[0].len();
    let height = rows.len();

    let adj = calc_adj(height, width);

    let mut graph = rows.iter().flatten().copied().collect::<Vec<_>>();

    let start = graph.iter().position(|&cell| cell == 'S').unwrap();
    let end = graph.iter().position(|&cell| cell == 'E').unwrap();

    graph[start] = 'a';
    graph[end] = 'z';

    let size = width * height;

    let part_one = bfs(start, end, &adj, &graph, size);

    let part_two = bfs_backwards(end, &adj, &graph, size).unwrap();

    (part_one, part_two)
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

fn bfs(root: usize, end: usize, adj: &Adj, graph: &[char], size: usize) -> usize {
    let mut distances = vec![0; size];

    let mut visited = vec![false; size];

    let mut q = VecDeque::new();

    visited[root] = true;

    q.push_back(root);

    distances[root] = 0;
    distances[end] = size;

    loop {
        let current = q.pop_front();

        match current {
            None => {
                break;
            }
            Some(elem) => {
                for &vec in adj[elem].iter() {
                    if visited[vec] {
                        continue;
                    }

                    if (graph[vec] as usize) <= (graph[elem] as usize) + 1 {
                        distances[vec] = distances[elem] + 1;
                        visited[vec] = true;

                        if vec != end {
                            q.push_back(vec);
                        }
                    }
                }
            }
        }
    }

    distances[end]
}

fn bfs_backwards(end: usize, adj: &Adj, graph: &[char], size: usize) -> Option<usize> {
    let mut distances = vec![0; size];

    let mut visited = vec![false; size];

    let mut q = VecDeque::new();

    visited[end] = true;

    q.push_back(end);

    let mut shortest: Option<usize> = None;

    loop {
        let current = q.pop_front();

        match current {
            None => {
                break;
            }
            Some(elem) => {
                for &vec in adj[elem].iter() {
                    if visited[vec] {
                        continue;
                    }

                    if (graph[vec] as usize) + 1 >= (graph[elem] as usize) {
                        distances[vec] = distances[elem] + 1;

                        visited[vec] = true;

                        if graph[vec] != 'a' {
                            q.push_back(vec);
                        } else {
                            match shortest {
                                None => shortest = Some(distances[vec]),
                                Some(n) if distances[vec] < n => {
                                    shortest = Some(distances[vec]);
                                }
                                _ => {}
                            }
                        }
                    }
                }
            }
        }
    }

    shortest
}
