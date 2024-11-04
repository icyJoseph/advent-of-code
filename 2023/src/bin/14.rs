#[aoc2023::main(14)]
fn main(input: &str) -> (usize, usize) {
    let mut platform = input
        .lines()
        .map(|line| line.chars().collect::<Vec<_>>())
        .collect::<Vec<_>>();

    for r in 1..platform.len() {
        for c in 0..platform[r].len() {
            if platform[r][c] != 'O' {
                continue;
            }

            let mut step = 0;

            while r > step {
                if platform[r - (step + 1)][c] == '.' {
                    step += 1;
                } else {
                    break;
                }
            }
            platform[r][c] = '.';
            platform[r - step][c] = 'O';
        }
    }

    let mut part_one = 0;

    let len = platform.len();

    for (i, row) in platform.iter().enumerate() {
        for ch in row {
            if *ch == 'O' {
                part_one += len - i;
            }
        }
    }

    (part_one, 0)
}
