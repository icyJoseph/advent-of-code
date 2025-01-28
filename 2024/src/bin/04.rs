fn calc_adj(width: usize, height: usize, size: usize, grid: &Vec<Vec<char>>) -> Vec<char> {
    let mut result: Vec<char> = vec![];

    let mut right = vec![];
    let mut left = vec![];

    let mut up = vec![];
    let mut down = vec![];

    let mut right_up = vec![];
    let mut right_down = vec![];

    let mut left_up = vec![];
    let mut left_down = vec![];

    for x in 0..width {
        for y in 0..height {
            for d in 0..size {
                let next_x = x + d;
                let next_y = y + d;

                if next_x < width {
                    right.push(grid[y][next_x]);
                } else {
                    right.clear();
                    right_up.clear();
                    right_down.clear();
                }

                if next_y < height {
                    down.push(grid[next_y][x]);
                } else {
                    down.clear();
                    right_down.clear();
                    left_down.clear();
                }

                if next_x < width && next_y < height {
                    right_down.push(grid[next_y][next_x]);
                }

                if d <= x {
                    let prev_x = x - d;

                    left.push(grid[y][prev_x]);

                    if next_y < height {
                        left_down.push(grid[next_y][prev_x]);
                    }
                } else {
                    left.clear();
                    left_down.clear();
                    left_up.clear();
                }

                if d <= y {
                    let prev_y = y - d;

                    up.push(grid[prev_y][x]);

                    if next_x < width {
                        right_up.push(grid[prev_y][next_x]);
                    }
                } else {
                    up.clear();
                    right_up.clear();
                    left_up.clear();
                }

                if d <= x && d <= y {
                    let prev_x = x - d;
                    let prev_y = y - d;

                    left_up.push(grid[prev_y][prev_x]);
                }
            }

            result.append(&mut right);
            result.append(&mut right_up);
            result.append(&mut right_down);

            result.append(&mut left);
            result.append(&mut left_up);
            result.append(&mut left_down);

            result.append(&mut up);
            result.append(&mut down);
        }
    }

    result
}

#[aoc2024::main(04)]
fn main(input: &str) -> (usize, usize) {
    let mut p1 = 0;

    let grid: Vec<Vec<char>> = input
        .lines()
        .map(|l| l.chars().collect::<_>())
        .collect::<_>();

    let width = grid[0].len();
    let height = grid.len();

    let size = 4;

    for section in calc_adj(width, height, size, &grid)[..].chunks(size) {
        if section[..] == ['X', 'M', 'A', 'S'] {
            p1 += 1;
        }
    }

    let mut p2 = 0;

    let fwd = ['S', 'A', 'M'];
    let back = ['M', 'A', 'S'];

    for (y, row) in grid.iter().enumerate() {
        if y == 0 || y == height - 1 {
            continue;
        }
        for (x, _) in row.iter().enumerate() {
            if x == 0 || x == width - 1 {
                continue;
            }

            if grid[y][x] != 'A' {
                continue;
            }

            let diag_up = [grid[y - 1][x - 1], grid[y][x], grid[y + 1][x + 1]];
            let diag_down = [grid[y + 1][x - 1], grid[y][x], grid[y - 1][x + 1]];

            if (diag_up == fwd || diag_up == back) && (diag_down == fwd || diag_down == back) {
                p2 += 1;
            }
        }
    }

    (p1, p2)
}
