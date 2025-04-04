#[aoc2024::main(08)]
fn main(input: &str) -> (usize, usize) {
    let grid = input
        .lines()
        .map(|row| row.chars().collect::<Vec<_>>())
        .collect::<Vec<Vec<_>>>();

    let cells = grid
        .iter()
        .enumerate()
        .flat_map(|(y, row)| {
            row.iter()
                .enumerate()
                .map(|(x, &cell)| (cell, x, y))
                .collect::<Vec<_>>()
        })
        .collect::<Vec<_>>();

    let antennas = cells
        .iter()
        .filter(|(cell, _, _)| *cell != '.')
        .collect::<Vec<_>>();

    let mut p1 = 0;

    for (_, x, y) in cells.iter() {
        let field = antennas
            .iter()
            .map(|(name, a_x, a_y)| {
                let dx = *a_x as i32 - *x as i32;
                let dy = *a_y as i32 - *y as i32;
                let slope = (dx as f32) / (dy as f32);

                (name, dx.abs() + dy.abs(), slope)
            })
            .collect::<Vec<_>>();

        for (pos, ant) in field.iter().enumerate() {
            let others = &field[pos + 1..];

            if others.iter().any(|other| {
                if other.0 != ant.0 {
                    return false;
                }

                if other.2 != ant.2 {
                    return false;
                }

                other.1 * 2 == ant.1 || other.1 == ant.1 * 2
            }) {
                p1 += 1;
                break;
            }
        }
    }

    (p1, 0)
}
