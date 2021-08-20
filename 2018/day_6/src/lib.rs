use std::cmp::{max, min};
use std::collections::HashMap;
use std::collections::VecDeque;

fn man_dist(left: (usize, usize), right: (usize, usize)) -> usize {
    max(left.0, right.0) - min(left.0, right.0) + max(left.1, right.1) - min(left.1, right.1)
}

fn calc_adj(r: usize, c: usize) -> Vec<Vec<usize>> {
    let norm = |i: usize, j: usize| c * i + j;

    let mut adj = vec![vec![]; r * c];

    for i in 0..r {
        for j in 0..c {
            let index = norm(i, j);
            if i > 0 {
                adj[index].push(norm(i - 1, j));
            }
            if j + 1 < c {
                adj[index].push(norm(i, j + 1));
            }
            if i + 1 < r {
                adj[index].push(norm(i + 1, j));
            }
            if j > 0 {
                adj[index].push(norm(i, j - 1));
            }
        }
    }

    adj
}

fn bfs(
    adj: &Vec<Vec<usize>>,
    distances: &mut Vec<(usize, usize, usize, bool, bool)>,
    r: usize,
    c: usize,
    sources: &Vec<(usize, usize)>,
) {
    let mut visited = vec![false; r * c];

    let mut q = VecDeque::new();

    for (x, y) in sources {
        let node = y * c + x;
        visited[node] = true;
        q.push_back((node, node));
    }

    loop {
        let next = q.pop_front();

        match next {
            None => {
                break;
            }
            Some((elem, parent)) => {
                for &node in adj[elem].iter() {
                    if visited[node] {
                        continue;
                    }

                    visited[node] = true;

                    // calc distance to other parents, if at least one is the same
                    // as distances[elem].2 + 1 then this node doesn't count as closest to any

                    let current_parent = (parent % c, parent / c);

                    let others = sources
                        .iter()
                        .filter(|&p| *p != current_parent)
                        .map(|&p| p)
                        .collect::<Vec<(usize, usize)>>();

                    let current_distance = distances[elem].2 + 1;

                    let current = (node % c, node / c);

                    let distance_to_others = others
                        .iter()
                        .map(|&p| man_dist(p, current))
                        .collect::<Vec<usize>>();

                    let should_count = !distance_to_others.contains(&current_distance);

                    let total_distance =
                        current_distance + distance_to_others.iter().sum::<usize>();

                    let is_safe = total_distance < 10000;

                    if is_safe {
                        // mark parent safe too, if it is within 1 distance
                        if man_dist(current_parent, current) == 1 {
                            distances[parent].4 = true;
                        }
                    }

                    distances[node] = (
                        parent % c,
                        parent / c,
                        current_distance,
                        should_count,
                        is_safe,
                    );

                    q.push_back((node, parent));
                }
            }
        }
    }
}

fn calc_distances(
    adj: &Vec<Vec<usize>>,
    r: usize,
    c: usize,
    sources: &Vec<(usize, usize)>,
) -> Vec<(usize, usize, usize, bool, bool)> {
    let mut distances = vec![0; r * c]
        .iter()
        .enumerate()
        .map(|(i, _)| (i % c, i / c, 0, true, false))
        .collect::<Vec<(usize, usize, usize, bool, bool)>>();

    bfs(&adj, &mut distances, r, c, &sources);

    distances
}

fn count_areas(
    flat_grid: &Vec<(usize, usize, usize, bool, bool)>,
    width: usize,
) -> HashMap<usize, usize> {
    let mut tally = HashMap::new();

    for entry in flat_grid {
        let (x, y, _, should_count, _) = entry;

        if *should_count {
            *tally.entry(y * width + x).or_insert(0) += 1;
        }
    }

    tally
}

fn translate(point: (usize, usize), dx: usize, dy: usize) -> (usize, usize) {
    (point.0 + dx, point.1 + dy)
}

pub fn solve(raw: String) -> () {
    let input = raw.trim();

    let places: Vec<(usize, usize)> = input
        .split("\n")
        .map(|x| {
            let spec = x
                .split(", ")
                .map(|y| y.parse::<usize>())
                .collect::<Vec<Result<usize, std::num::ParseIntError>>>();

            match spec[0] {
                Ok(x) => match spec[1] {
                    Ok(y) => (x, y),
                    Err(_) => panic!("Error parsing y coord"),
                },
                Err(_) => panic!("Error parsing x coord"),
            }
        })
        .collect();

    let cols = places.iter().map(|p| p.0).max().unwrap() + 1;
    let rows = places.iter().map(|p| p.1).max().unwrap() + 1;

    let adj = calc_adj(rows, cols);

    let distances = calc_distances(&adj, rows, cols, &places);

    // count areas in a section defined by the input params
    let tally = count_areas(&distances, cols);

    // translate the input params
    let x_places = places
        .iter()
        .map(|p| translate(*p, 50, 50))
        .collect::<Vec<(usize, usize)>>();

    // extend the section defined by the input params, by the same
    // translation done above
    let x_cols = x_places.iter().map(|p| p.0).max().unwrap() + 50;
    let x_rows = x_places.iter().map(|p| p.1).max().unwrap() + 50;

    let x_adj = calc_adj(x_rows, x_cols);

    let x_distances = calc_distances(&x_adj, x_rows, x_cols, &x_places);

    let x_tally = count_areas(&x_distances, x_cols);

    let mut stable = vec![];

    for (key, value) in &tally {
        let (x, y) = (key % cols + 50, key / cols + 50);
        let x_key = y * x_cols + x;

        match x_tally.get(&x_key) {
            // Finite areas do not change their size
            // after translating and expanding the grid
            Some(x_value) if x_value == value => stable.push(value),
            _ => continue,
        }
    }

    match stable.iter().max() {
        Some(m) => println!("Part 1: {}", m),
        None => panic!("No stable area found"),
    }

    let safe_area_count = distances.iter().filter(|(_, _, _, _, safe)| *safe).count();

    println!("Part 2: {}", safe_area_count);
}
