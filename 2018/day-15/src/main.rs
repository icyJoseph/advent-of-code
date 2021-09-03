use aoc;
use std::cell::Cell;
use std::collections::VecDeque;

type Res<T> = Result<T, Box<dyn std::error::Error>>;

type Adj = Vec<Vec<usize>>;

fn tp_mod((x, y): (usize, usize), width: usize) -> usize {
    norm(x, y, width)
}

fn norm(x: usize, y: usize, width: usize) -> usize {
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

#[derive(Debug, Copy, Clone, PartialEq)]
enum Kind {
    Elf,
    Goblin,
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
    fn new(x: usize, y: usize, value: char, dmg: Option<u32>) -> Self {
        let kind = match value {
            'E' => Kind::Elf,
            'G' => Kind::Goblin,
            _ => panic!("Nor a Goblin nor Elf"),
        };

        let attack_power = match dmg {
            Some(d) => d,
            None => 3,
        };

        Unit {
            kind,
            x: Cell::new(x),
            y: Cell::new(y),
            hp: Cell::new(200),
            attack_power,
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

    fn take_dmg(&mut self, dmg: u32) -> () {
        self.hp.set(if self.hp.get() > dmg {
            self.hp.get() - dmg
        } else {
            0
        });
    }

    fn is_dead(&self) -> bool {
        self.hp.get() == 0
    }
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

fn bfs(
    adj: &Adj,
    height: usize,
    width: usize,
    root: (usize, usize),
    nodes: &Vec<Vec<Node>>,
    units: &Vec<Unit>,
) -> Vec<Option<usize>> {
    let mut distances = vec![None; height * width];

    let mut visited = vec![false; height * width];

    let mut q = VecDeque::new();

    let (x, y) = root;
    let node = x + width * y;
    visited[node] = true;

    q.push_back(node);
    // distance to self is zero
    distances[node] = Some(0);

    loop {
        let next = q.pop_front();

        match next {
            None => {
                break;
            }
            Some(elem) => {
                for &leave in adj[elem].iter() {
                    if visited[leave] {
                        continue;
                    }

                    visited[leave] = true;

                    let (t_x, t_y) = u_mod(leave, width);

                    match nodes[t_y][t_x].terrain {
                        Terrain::Ground => {
                            if units.iter().any(|unit| {
                                let (u_x, u_y) = unit.get_pos();
                                norm(u_x, u_y, width) == leave
                            }) {
                                // occupied by some unit
                                distances[leave] = None;
                            } else {
                                if let Some(dist) = distances[elem] {
                                    q.push_back(leave);
                                    distances[leave] = Some(dist + 1);
                                } else {
                                    distances[leave] = None;
                                }
                            }
                        }
                        Terrain::Wall => {
                            distances[leave] = None;
                        }
                    }
                }
            }
        }
    }

    distances
}

#[allow(dead_code)]
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

    println!("\n");

    for row in grid {
        println!("{}", row.iter().collect::<String>());
    }

    println!("\n");
}

fn find_attack(
    adj: &Adj,
    unit_pos: &(usize, usize),
    enemies: &Vec<&Unit>,
    units: &Vec<Unit>,
    width: usize,
) -> Option<usize> {
    // check around this unit, can it attack?
    // if so, attack and continue
    // otherwise try to move and attack
    let quick_attack = &adj[tp_mod(*unit_pos, width)]
        .iter()
        .filter_map(|p| {
            enemies
                .iter()
                .find(|enemy| tp_mod(enemy.get_pos(), width) == *p)
        })
        .collect::<Vec<_>>();

    let mut result = None;

    // find weakest, and first by reading order
    if let Some(min) = quick_attack
        .iter()
        .min_by(|a, b| a.hp.get().cmp(&b.hp.get()))
    {
        // filter out those who have too much hp
        let mut weak = quick_attack
            .iter()
            .filter(|en| en.hp.get() <= min.hp.get())
            .collect::<Vec<_>>();

        // sort by reading order
        weak.sort_by(|a, b| tp_mod(a.get_pos(), width).cmp(&tp_mod(b.get_pos(), width)));

        if let Some(target) = weak.get(0) {
            result = units.iter().position(|u| u.get_pos() == target.get_pos());
        };
    };

    result
}

fn find_move(
    adj: &Adj,
    unit_pos: &(usize, usize),
    nodes: &Vec<Vec<Node>>,
    enemies: &Vec<&Unit>,
    units: &Vec<Unit>,
    width: usize,
    height: usize,
) -> Option<(usize, usize)> {
    let distances = bfs(&adj, height, width, *unit_pos, &nodes, &units);

    let mut result = None;
    // collect all adjacent points to enemies
    let mut targets: Vec<(usize, usize)> = vec![];

    for enemy in enemies {
        let enemy_adj = &adj[tp_mod(enemy.get_pos(), width)];

        for near in enemy_adj {
            if let Some(dist) = distances[*near] {
                targets.push((dist, *near));
            }
        }
    }

    // helper function to sort by reading order and distance
    let compare = |a: &(usize, usize), b: &(usize, usize)| {
        let cmp = a.0.cmp(&b.0);

        match cmp {
            std::cmp::Ordering::Equal => a.1.cmp(&b.1),
            _ => cmp,
        }
    };

    // sort by reading order and distance ascending
    targets.sort_by(compare);

    // take the closest by reading order
    if let Some(chosen) = targets.get(0) {
        // from the chosen place measure distances to
        // the adjanced cells to the current unit
        let reverse_distances = bfs(&adj, height, width, u_mod(chosen.1, width), &nodes, &units);

        let mut next_move: Vec<(usize, usize)> = vec![];

        let possible_next_moves = &adj[tp_mod(*unit_pos, width)];

        for m in possible_next_moves {
            if let Some(rev_dist) = reverse_distances[*m] {
                next_move.push((rev_dist, *m));
            }
        }

        // keep those which have shortest distance
        next_move.sort_by(compare);

        // choose an adjacent cell by reading order
        if let Some(&(_, val)) = next_move.get(0) {
            result = Some(u_mod(val, width));
        }
    };

    result
}

fn solve(raw: String) -> () {
    let simulation = |elf_dmg: u32| {
        // war init
        let rows = raw
            .trim()
            .split("\n")
            .map(|row| row.trim().chars().collect::<Vec<char>>())
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

                if value == 'G' {
                    units.push(Unit::new(x, y, value, None));
                }

                if value == 'E' {
                    units.push(Unit::new(x, y, value, Some(elf_dmg)));
                }
            }

            nodes.push(row);
        }

        // prepare adj matrix for bfs
        let adj = calc_adj(height, width);

        let mut round = 0;

        let total_elves = units.iter().filter(|u| u.kind == Kind::Elf).count();

        let fight = || loop {
            // plot(&nodes, &units);
            units = units.into_iter().filter(|u| !u.is_dead()).collect::<_>();
            units.sort_by(|a, b| tp_mod(a.get_pos(), width).cmp(&tp_mod(b.get_pos(), width)));

            // fight loop
            for i in 0..units.len() {
                if units[i].is_dead() {
                    continue;
                }

                // copy some immutable data from the unit
                let unit_pos = units[i].get_pos();
                let unit_kind = units[i].kind;
                let attack_power = units[i].attack_power;

                // collect from previous iteration
                // those which are still alive
                let prev: Vec<Unit> = units
                    .to_vec()
                    .into_iter()
                    .filter(|u| !u.is_dead())
                    .collect::<_>();

                // now calculate enemies
                let enemies = prev
                    .iter()
                    .filter(|u| u.kind != unit_kind)
                    .collect::<Vec<_>>();

                // exit condition
                if enemies.len() == 0 {
                    let survivors = units
                        .iter()
                        .filter(|x| !x.is_dead())
                        .collect::<Vec<&Unit>>();

                    return (
                        round,
                        survivors.iter().filter(|x| x.kind == Kind::Elf).count() == total_elves,
                        survivors.iter().map(|u| u.hp.get()).sum::<u32>(),
                    );
                }

                // try to attack and continue
                if let Some(index) = find_attack(&adj, &unit_pos, &enemies, &units, width) {
                    units[index].take_dmg(attack_power);
                } else {
                    // otherwise try to move and attack
                    if let Some((d_x, d_y)) =
                        find_move(&adj, &unit_pos, &nodes, &enemies, &prev, width, height)
                    {
                        let new_pos = units[i].move_to(d_x, d_y);

                        if let Some(index) = find_attack(&adj, &new_pos, &enemies, &units, width) {
                            units[index].take_dmg(attack_power);
                        }
                    };
                }
            }

            round += 1;
        };

        fight()
    };

    let mut dmg = 3;

    loop {
        let (final_round, all_elves_survive, score) = simulation(dmg);

        if dmg == 3 {
            println!("Part 1: {}", final_round * score);
        }

        if all_elves_survive {
            println!("Part 2: {}", final_round * score);
            break;
        }

        dmg += 1;
    }
}

fn main() -> Res<()> {
    let input = aoc::get_input(2018, 15);

    solve(input);

    Ok(())
}
