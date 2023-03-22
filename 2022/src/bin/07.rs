use std::collections::{HashMap, HashSet};
use std::iter::Peekable;

fn is_dir(path: &str) -> bool {
    path.starts_with('/')
}

fn is_dirname_description(description: &str) -> bool {
    description.starts_with("dir ")
}

fn dirname_from_description(description: &str) -> String {
    description.to_string().replace("dir ", "")
}

fn get_size(description: &str) -> Option<usize> {
    description
        .split_whitespace()
        .find_map(|n| n.parse::<usize>().ok())
}

fn peek_take_while<I: Iterator<Item = String>>(
    iter: &mut Peekable<I>,
    predicate: fn(&str) -> bool,
) -> Vec<String> {
    let mut result = vec![];

    while let Some(item) = iter.peek() {
        if predicate(item) {
            result.push(item.to_string());
            iter.next();
        } else {
            break;
        }
    }

    result
}

fn create_directories(input: &str, root: &str) -> HashMap<String, HashSet<String>> {
    let mut lines = input
        .split('\n')
        .map(|s| s.to_string())
        .into_iter()
        .peekable();

    let mut current = root.to_string();

    let mut directories: HashMap<String, HashSet<String>> = HashMap::new();

    while let Some(line) = lines.next() {
        if line.starts_with("$ ls") {
            let children = peek_take_while(&mut lines, |l| !l.starts_with('$'));

            for child in children.iter() {
                directories.entry(current.to_string()).and_modify(|set| {
                    if is_dirname_description(child) {
                        let path = format!("{}{}/", current, dirname_from_description(child));

                        set.insert(path);
                    } else {
                        set.insert(child.to_string());
                    }
                });
            }
        }

        if line.starts_with("$ cd ") {
            let ch_dir = line.replace("$ cd ", "");

            if ch_dir == ".." {
                // find parent
                for (dir, dir_children) in directories.iter() {
                    if dir_children.contains(&current) {
                        current = dir.to_owned();
                        break;
                    }
                }
            } else {
                current = if ch_dir == root {
                    root.to_string()
                } else {
                    format!("{}{}/", current, ch_dir)
                };

                directories.entry(current.to_string()).or_default();
            }
        }
    }

    directories
}

fn calc_dir_size(
    children: &HashSet<String>,
    directories: &HashMap<String, HashSet<String>>,
) -> usize {
    let mut file_children: Vec<String> = children.iter().map(|x| x.to_string()).collect::<Vec<_>>();

    while file_children.iter().any(|f| is_dir(f)) {
        file_children = file_children
            .iter()
            .flat_map(|f| {
                if is_dir(f) {
                    if let Some(nested) = directories.get(f) {
                        return nested
                            .iter()
                            .map(|x| x.to_string())
                            .collect::<Vec<String>>();
                    }

                    return vec![];
                }

                vec![f.to_string()]
            })
            .collect::<Vec<_>>();
    }

    file_children
        .iter()
        .filter_map(|f| get_size(f))
        .sum::<usize>()
}

#[aoc2022::main(07)]
fn main(input: &str) -> (usize, usize) {
    let root = String::from("/");

    let directories = create_directories(input, &root);

    let mut part_one = 0;

    for dir in directories.iter() {
        let dir_size = calc_dir_size(dir.1, &directories);

        if dir_size <= 100_000 {
            part_one += dir_size;
        }
    }

    let root_size = match directories.get(&root) {
        Some(dir) => calc_dir_size(dir, &directories),
        None => 0,
    };

    let available = 70_000_000;
    let required = 30_000_000;
    let target = required - (available - root_size);

    let mut min_size = root_size;

    for dir in directories.iter() {
        let dir_size = calc_dir_size(dir.1, &directories);

        if target <= dir_size && dir_size <= min_size {
            min_size = dir_size;
        }
    }

    (part_one, min_size)
}
