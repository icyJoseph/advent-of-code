struct Tracker {
    index: usize,
    trees: i32,
    right_step: usize,
}

pub fn tree_counter(grid: &Vec<String>, down_step: usize, right_step: usize) -> i32 {
    let width = match grid.get(0) {
        Some(w) => w.len(),
        _ => panic!("No width?"),
    };

    let tracker = grid.into_iter().fold(
        Tracker {
            index: 0,
            trees: 0,
            right_step: 0,
        },
        |prev, curr| {
            let next_index = prev.index + 1;
            if prev.index % down_step != 0 {
                return Tracker {
                    index: next_index,
                    ..prev
                };
            }
            let next_right = (prev.right_step + right_step) % width;
            match curr.chars().nth(prev.right_step) {
                Some(c) if c == '#' => Tracker {
                    index: next_index,
                    trees: prev.trees + 1,
                    right_step: next_right,
                },
                _ => Tracker {
                    index: next_index,
                    right_step: next_right,
                    ..prev
                },
            }
        },
    );

    tracker.trees
}

pub fn part_one(grid: &Vec<String>) -> i32 {
    tree_counter(grid, 1, 3)
}

pub fn part_two(grid: &Vec<String>) -> i32 {
    tree_counter(grid, 1, 1)
        * tree_counter(grid, 1, 3)
        * tree_counter(grid, 1, 5)
        * tree_counter(grid, 1, 7)
        * tree_counter(grid, 2, 1)
}
