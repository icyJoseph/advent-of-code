use aoc;
use std::cell::Cell;
use std::collections::VecDeque;

type Res<T> = Result<T, Box<dyn std::error::Error>>;

type Adj = Vec<Vec<usize>>;

fn tp_mod((x, y): (usize, usize), width: usize) -> usize {
    x + y * width
}

fn c_mod(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

fn u_mod(m: usize, width: usize) -> (usize, usize) {
    (m % width, m / width)
}

#[derive(Debug, Copy, Clone)]
enum Terrain {
    Ground,
    Wall,
}

#[derive(Debug, Copy, Clone)]
struct Node {
    terrain: Terrain,
    x: usize,
    y: usize,
}

#[derive(Debug, Copy, Clone)]
enum Kind {
    Elf,
    Goblin,
}

impl std::cmp::PartialEq for Kind {
    fn eq(&self, other: &Self) -> bool {
        match (self, other) {
            (Kind::Elf, Kind::Elf) => true,
            (Kind::Elf, Kind::Goblin) => false,
            (Kind::Goblin, Kind::Goblin) => true,
            (Kind::Goblin, Kind::Elf) => false,
        }
    }
}

#[derive(Debug, Clone)]
struct Unit {
    kind: Kind,
    x: Cell<usize>,
    y: Cell<usize>,
    hp: Cell<u32>,
    attack_power: u32,
}

impl Node {
    fn new(x: usize, y: usize, value: char) -> Self {
        let terrain = match value {
            '#' => Terrain::Wall,
            'E' | 'G' | '.' => Terrain::Ground,
            _ => panic!("Unknown terrain"),
        };

        Node { x, y, terrain }
    }
}

impl Unit {
    fn new(x: usize, y: usize, value: char) -> Self {
        let kind = match value {
            'E' => Kind::Elf,
            'G' => Kind::Goblin,
            _ => panic!("Nor a Goblin nor Elf"),
        };

        Unit {
            kind,
            x: Cell::new(x),
            y: Cell::new(y),
            hp: Cell::new(200),
            attack_power: 3,
        }
    }

    fn get_pos(&self) -> (usize, usize) {
        (self.x.get(), self.y.get())
    }

    fn move_to(&mut self, x: usize, y: usize) -> (usize, usize) {
        self.x.set(x);
        self.y.set(y);

        (self.x.get(), self.y.get())
    }

    fn is_dead(&self) -> bool {
        self.hp.get() == 0
    }

    fn take_dmg(&mut self, dmg: u32) -> () {
        self.hp.set(if self.hp.get() > dmg {
            self.hp.get() - dmg
        } else {
            0
        });
    }
}

// r: height, c: width
fn calc_adj(r: usize, c: usize) -> Adj {
    let norm = |i: usize, j: usize| i + c * j;

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
    adj: &Adj,
    distances: &mut Vec<Option<usize>>,
    r: usize,
    c: usize,
    root: (usize, usize),
    nodes: &Vec<Vec<Node>>,
    units: &Vec<Unit>,
) {
    let mut visited = vec![false; r * c];

    let mut q = VecDeque::new();

    let (x, y) = root;
    let node = x + c * y;
    visited[node] = true;
    q.push_back(node);

    distances[node] = Some(0);

    loop {
        let next = q.pop_front();

        match next {
            None => {
                break;
            }
            Some(elem) => {
                for &node in adj[elem].iter() {
                    if visited[node] {
                        continue;
                    }

                    visited[node] = true;

                    let (t_x, t_y) = u_mod(node, c);

                    match nodes[t_y][t_x].terrain {
                        Terrain::Ground => {
                            if units.iter().any(|unit| {
                                let (u_x, u_y) = unit.get_pos();
                                c_mod(u_x, u_y, c) == node
                            }) {
                                // occupied by some unit
                                distances[node] = None;
                            } else {
                                distances[node] = match distances[elem] {
                                    Some(e) => Some(e + 1),
                                    None => None,
                                };
                                q.push_back(node);
                            }
                        }
                        Terrain::Wall => {
                            distances[node] = None;
                        }
                    }
                }
            }
        }
    }
}

fn calc_distances(
    adj: &Adj,
    r: usize,
    c: usize,
    root: (usize, usize),
    nodes: &Vec<Vec<Node>>,
    units: &Vec<Unit>,
) -> Vec<Option<usize>> {
    let mut distances = vec![None; r * c];

    bfs(&adj, &mut distances, r, c, root, &nodes, &units);

    distances
}

fn plot(nodes: &Vec<Vec<Node>>, units: &Vec<Unit>) -> () {
    let width = nodes[0].len();
    let height = nodes.len();

    let mut grid = vec![vec!['.'; width]; height];

    for y in 0..height {
        for x in 0..width {
            grid[y][x] = match nodes[y][x].terrain {
                Terrain::Wall => '#',
                Terrain::Ground => '.',
            }
        }
    }

    for unit in units {
        if unit.is_dead() {
            continue;
        }
        let (u_x, u_y) = unit.get_pos();
        grid[u_y][u_x] = match unit.kind {
            Kind::Goblin => 'G',
            Kind::Elf => 'E',
        }
    }

    println!("\n\n\n");

    for row in grid {
        println!("{}", row.iter().collect::<String>());
    }

    println!("\n\n\n");
}

fn solve(raw: String) -> () {
    // war init
    let rows = raw
        .trim()
        .split("\n")
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let width = rows[0].len();
    let height = rows.len();

    let mut nodes = vec![];
    let mut units = vec![];

    for y in 0..rows.len() {
        let mut row = vec![];

        for x in 0..rows[y].len() {
            let value = rows[y][x];
            row.push(Node::new(x, y, value));

            if value == 'G' || value == 'E' {
                units.push(Unit::new(x, y, value));
            }
        }

        nodes.push(row);
    }

    plot(&nodes, &units);

    // prepare bfs
    let adj = calc_adj(height, width);

    let mut round = 0;

    let war = move || loop {
        println!("AFTER ROUND {}", round);
        units.sort_by(|a, b| {
            let (a_x, a_y) = a.get_pos();
            let (b_x, b_y) = b.get_pos();

            c_mod(a_x, a_y, width).cmp(&c_mod(b_x, b_y, width))
        });

        units = units.into_iter().filter(|u| !u.is_dead()).collect::<_>();

        println!(
            "{:?}",
            units
                .iter()
                .map(|u| format!("{:?}({})", u.kind, u.hp.get()))
                .collect::<Vec<String>>()
        );

        // war loop
        for i in 0..units.len() {
            println!("\n\n");

            let prev: Vec<Unit> = units
                .to_vec()
                .into_iter()
                .filter(|u| !u.is_dead())
                .collect::<_>();

            let unit = &units[i];

            let unit_kind = unit.kind;
            let attack_power = unit.attack_power;

            if unit.is_dead() {
                continue;
            }

            println!("Unit: {:?}", unit);

            // now calculate enemies
            let enemies = prev
                .iter()
                .filter(|u| u.kind != unit.kind)
                .collect::<Vec<_>>();

            if round == 100 || enemies.len() == 0 {
                return (
                    round,
                    units
                        .iter()
                        .filter(|x| !x.is_dead())
                        .map(|u| u.hp.get())
                        .sum::<u32>(),
                );
            }

            // println!("Enemies: {:?}", enemies);

            // distances to all available nodes
            let distances = calc_distances(&adj, height, width, unit.get_pos(), &nodes, &prev);

            let (around, min) = {
                let mut all = vec![];

                let mut min = None;

                // get distances to points around each enemy
                for enemy in &enemies {
                    let (x, y) = enemy.get_pos();
                    // println!(" {:?} \n {:?}", unit, enemy);

                    let mut around = vec![
                        if y > 0 {
                            Some(c_mod(x, y - 1, width))
                        } else {
                            None
                        },
                        if x > 0 {
                            Some(c_mod(x - 1, y, width))
                        } else {
                            None
                        },
                        if x < width - 1 {
                            Some(c_mod(x + 1, y, width))
                        } else {
                            None
                        },
                        if y < height - 1 {
                            Some(c_mod(x, y + 1, width))
                        } else {
                            None
                        },
                    ]
                    .into_iter()
                    .filter_map(|m| {
                        if let Some(q) = m {
                            match distances[q] {
                                Some(d) => {
                                    match min {
                                        Some(current) if d < current => {
                                            min = Some(d);
                                        }
                                        Some(_) => {}
                                        None => {
                                            min = Some(d);
                                        }
                                    }

                                    Some((q, d))
                                }
                                None => None,
                            }
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<(usize, usize)>>();

                    all.append(&mut around);
                }

                match min {
                    Some(m) => (all, m),
                    None => (all, 0),
                }
            };

            // println!("{:?} - min {}", around, min);
            // remove taken places around this enemy
            let mut free_around = around.iter().filter(|(_, d)| *d <= min).collect::<Vec<_>>();

            free_around.sort_by(|a, b| a.0.cmp(&b.0));

            // println!("Enemies spots: {:?}", free_around);
            match free_around.get(0) {
                Some((m, d)) => {
                    if *d == 0 && tp_mod(unit.get_pos(), width) == *m {
                        // moving here would cause overlap
                        // println!("Overlap - Attack instead {:?}", unit.get_pos());
                        // get four around
                        // sort by hp, and attack
                        let (x, y) = unit.get_pos();

                        let attack = vec![
                            if y > 0 {
                                Some(c_mod(x, y - 1, width))
                            } else {
                                None
                            },
                            if x > 0 {
                                Some(c_mod(x - 1, y, width))
                            } else {
                                None
                            },
                            if x < width - 1 {
                                Some(c_mod(x + 1, y, width))
                            } else {
                                None
                            },
                            if y < height - 1 {
                                Some(c_mod(x, y + 1, width))
                            } else {
                                None
                            },
                        ]
                        .iter()
                        .filter_map(|m| {
                            if let Some(q) = m {
                                prev.iter().find(|e| {
                                    e.get_pos() == u_mod(*q, width) && e.kind != unit.kind
                                })
                            } else {
                                None
                            }
                        })
                        .collect::<Vec<_>>();

                        println!("Attack candidates {:?}", attack);

                        match attack.iter().min_by(|a, b| a.hp.get().cmp(&b.hp.get())) {
                            Some(min) => {
                                let mut to_attack = attack
                                    .iter()
                                    .filter(|u| u.hp.get() == min.hp.get())
                                    .collect::<Vec<_>>();

                                to_attack.sort_by(|a, b| {
                                    tp_mod(a.get_pos(), width).cmp(&tp_mod(b.get_pos(), width))
                                });

                                match to_attack.get(0) {
                                    Some(target) => {
                                        match units.iter().position(|u| {
                                            tp_mod(u.get_pos(), width)
                                                == tp_mod(target.get_pos(), width)
                                                && !u.is_dead()
                                        }) {
                                            Some(p) => {
                                                println!(" -> Attacks {:?}", units[p]);
                                                units[p].take_dmg(attack_power);
                                            }
                                            None => {}
                                        }
                                    }
                                    None => {}
                                }
                            }
                            None => {}
                        }

                        // println!("\n\n\n");

                        continue;
                    }

                    let (m_x, m_y) = u_mod(*m, width);

                    // move
                    let (x, y) = unit.get_pos();
                    let s_distances =
                        calc_distances(&adj, height, width, (m_x, m_y), &nodes, &prev);

                    //  println!("Paths: {:?}", s_distances);

                    let around = vec![
                        if y > 0 {
                            Some(c_mod(x, y - 1, width))
                        } else {
                            None
                        },
                        if x > 0 {
                            Some(c_mod(x - 1, y, width))
                        } else {
                            None
                        },
                        if x < width - 1 {
                            Some(c_mod(x + 1, y, width))
                        } else {
                            None
                        },
                        if y < height - 1 {
                            Some(c_mod(x, y + 1, width))
                        } else {
                            None
                        },
                    ]
                    .iter()
                    .filter_map(|m| {
                        if let Some(q) = m {
                            // println!("{} - {:?}", q, u_mod(*q, width));
                            match s_distances[*q] {
                                Some(d) => Some((*q, d)),
                                None => None,
                            }
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<(usize, usize)>>();
                    // println!("All move options: {:?}", around);

                    let mut free_around = around
                        .iter()
                        .filter(|(m, p)| {
                            // Keep only if shortest path
                            *d == p + 1
                        })
                        .collect::<Vec<_>>();

                    // println!("Move options: {:?}", free_around);
                    free_around.sort_by(|a, b| a.0.cmp(&b.0));

                    match free_around.get(0) {
                        Some((n, d)) => {
                            let (d_x, d_y) = u_mod(*n, width);
                            println!(" -> Move to {},{}", d_x, d_y);
                            let (n_x, n_y) = units[i].move_to(d_x, d_y);

                            let attack = vec![
                                if n_y > 0 {
                                    Some(c_mod(n_x, n_y - 1, width))
                                } else {
                                    None
                                },
                                if n_x > 0 {
                                    Some(c_mod(n_x - 1, n_y, width))
                                } else {
                                    None
                                },
                                if n_x < width - 1 {
                                    Some(c_mod(n_x + 1, n_y, width))
                                } else {
                                    None
                                },
                                if n_y < height - 1 {
                                    Some(c_mod(n_x, n_y + 1, width))
                                } else {
                                    None
                                },
                            ]
                            .iter()
                            .filter_map(|m| {
                                if let Some(q) = m {
                                    prev.iter().find(|e| {
                                        e.get_pos() == u_mod(*q, width) && e.kind != unit_kind
                                    })
                                } else {
                                    None
                                }
                            })
                            .collect::<Vec<_>>();

                            println!("Attack candidates {:?}", attack);

                            match attack.iter().min_by(|a, b| a.hp.get().cmp(&b.hp.get())) {
                                Some(min) => {
                                    let mut to_attack = attack
                                        .iter()
                                        .filter(|u| u.hp.get() == min.hp.get())
                                        .collect::<Vec<_>>();

                                    to_attack.sort_by(|a, b| {
                                        tp_mod(a.get_pos(), width).cmp(&tp_mod(b.get_pos(), width))
                                    });

                                    match to_attack.get(0) {
                                        Some(target) => {
                                            match units.iter().position(|u| {
                                                tp_mod(u.get_pos(), width)
                                                    == tp_mod(target.get_pos(), width)
                                                    && !u.is_dead()
                                            }) {
                                                Some(p) => {
                                                    println!(" -> Attacks {:?}", units[p]);
                                                    units[p].take_dmg(attack_power);
                                                }
                                                None => {}
                                            }
                                        }
                                        None => {}
                                    }
                                }
                                None => {}
                            }
                        }

                        None => continue,
                    }
                }
                None => continue,
            }
        }

        round += 1;

        plot(&nodes, &units);
    };

    let last_round = war();
    println!(
        "Last round {:?} - {}",
        last_round,
        last_round.0 * last_round.1
    );
}

fn main() -> Res<()> {
    let input = aoc::get_input(2018, 15);
    let _input = "#########
#G..G..G#
#.......#
#.......#
#G..E..G#
#.......#
#.......#
#G..G..G#
#########
"
    .to_string();

    let _input = "#######
#.G...#
#...EG#
#.#.#G#
#..G#E#
#.....#
#######
"
    .to_string();

    solve(input);

    Ok(())
}
