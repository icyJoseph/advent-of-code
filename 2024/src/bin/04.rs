fn calc_adj(width: usize, height: usize) -> Vec<Vec<Vec<(usize, usize)>>> {
    let mut result: Vec<Vec<Vec<(usize, usize)>>> = vec![];

    for x in 0..width {
        for y in 0..height {
            let mut acc = vec![];

            let mut right = vec![];
            let mut left = vec![];

            let mut up = vec![];
            let mut down = vec![];

            let mut right_up = vec![];
            let mut right_down = vec![];
            let mut left_up = vec![];
            let mut left_down = vec![];

            for d in 0..4 {
                let next_x = x + d;
                let next_y = y + d;

                if next_x < width {
                    right.push((next_x, y));
                }

                if next_y < height {
                    down.push((x, next_y));
                }

                if next_x < width && next_y < height {
                    right_down.push((next_x, next_y));
                }

                if d <= x {
                    let prev_x = x - d;

                    left.push((prev_x, y));

                    if next_y < height {
                        left_down.push((prev_x, next_y));
                    }
                }

                if d <= y {
                    let prev_y = y - d;

                    up.push((x, prev_y));

                    if next_x < width {
                        right_up.push((next_x, prev_y));
                    }
                }

                if d <= x && d <= y {
                    let prev_x = x - d;
                    let prev_y = y - d;

                    left_up.push((prev_x, prev_y));
                }
            }

            if right.len() == 4 {
                acc.push(right);
            }

            if right_up.len() == 4 {
                acc.push(right_up);
            }

            if right_down.len() == 4 {
                acc.push(right_down);
            }

            if left.len() == 4 {
                acc.push(left);
            }

            if left_up.len() == 4 {
                acc.push(left_up);
            }

            if left_down.len() == 4 {
                acc.push(left_down);
            }

            if up.len() == 4 {
                acc.push(up);
            }

            if down.len() == 4 {
                acc.push(down);
            }

            result.push(acc);
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

    for entry in calc_adj(width, height) {
        for section in entry {
            let word = section
                .iter()
                .map(|(x, y)| grid[*y][*x])
                .collect::<String>();

            if word == "XMAS" {
                p1 += 1;
            }
        }
    }

    let mut p2 = 0;

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

            let diag_up = format!("{}{}{}", grid[y - 1][x - 1], grid[y][x], grid[y + 1][x + 1]);
            let diag_down = format!("{}{}{}", grid[y + 1][x - 1], grid[y][x], grid[y - 1][x + 1]);

            if diag_up == "SAM" || diag_up == "MAS" {
                if diag_down == "MAS" || diag_down == "SAM" {
                    p2 += 1;
                }
            }
        }
    }

    (p1, p2)
}
