#[aoc2022::main(08)]
fn main(input: &str) -> (usize, usize) {
    let grid = input
        .trim()
        .lines()
        .map(|line| {
            line.chars()
                .filter_map(|c| c.to_digit(10))
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();

    let width = grid[0].len();
    let height = grid.len();

    let mut visible = 0;
    let mut score = 0;

    for y in 0..height {
        for x in 0..width {
            let row = &grid[y];
            let col = grid.iter().map(|row| row[x]).collect::<Vec<_>>();

            let current = grid[y][x];

            // find blockers
            let lhs = row[..x].iter().rev().position(|&tree| tree >= current);
            let rhs = row[x + 1..].iter().position(|&tree| tree >= current);
            let up = col[..y].iter().rev().position(|&tree| tree >= current);
            let down = col[y + 1..].iter().position(|&tree| tree >= current);

            match (up, rhs, down, lhs) {
                // Something is blocking in all directions
                (Some(_), Some(_), Some(_), Some(_)) => {
                    // continue;
                }
                _ => visible += 1,
            }

            let lhs = match lhs {
                Some(p) => p + 1,
                None => x,
            };

            let rhs = match rhs {
                Some(p) => p + 1,
                None => width - x - 1,
            };
            let up = match up {
                Some(p) => p + 1,
                None => y,
            };
            let down = match down {
                Some(p) => p + 1,
                None => height - y - 1,
            };

            let current_score = lhs * rhs * up * down;

            if current_score > score {
                score = current_score
            }
        }
    }

    (visible, score)
}
