fn take_decimal(x: i32) -> i32 {
    (x / 100) % 10
}

fn power_level(x: i32, y: i32, sn: i32) -> i32 {
    let rack_id = x + 10;

    take_decimal(((rack_id) * y + sn) * rack_id) - 5
}

fn window_power(grid: &Vec<Vec<i32>>, width: usize, height: usize) -> Option<(usize, usize, i32)> {
    let h = grid.len();
    let w = grid[0].len();

    let mut max_level = None;

    for y in 1..h - (height - 1) {
        for x in 1..w - (width - 1) {
            let mut sub_grid = 0;

            for r in 0..height {
                sub_grid += grid[y + r][x..x + width].iter().sum::<i32>();
            }

            match max_level {
                None => max_level = Some((x, y, sub_grid)),
                Some((_, _, level)) if level < sub_grid => max_level = Some((x, y, sub_grid)),
                _ => {}
            }
        }
    }

    max_level
}

fn solve(raw: i32) -> () {
    let (w, h) = (300, 300);

    let mut grid = vec![vec![0; w]; h];

    for y in 0..h {
        for x in 0..w {
            grid[y][x] = power_level(x as i32, y as i32, raw);
        }
    }

    let max_power_level_3x3 = window_power(&grid, 3, 3);

    match max_power_level_3x3 {
        Some((x, y, _)) => {
            println!("Part 1: {},{}", x, y);
        }
        None => panic!("No power levels were found"),
    }

    let mut max_levels = vec![];

    for size in 1..=300 {
        println!("Processing: {}", size);

        let max_level = window_power(&grid, size, size);

        println!("Result: {:?} \n\n", max_level);

        match max_level {
            Some((_, _, p)) if p < 0 => {
                break;
            }
            _ => {}
        }

        match max_level {
            Some((x, y, p)) => max_levels.push((x, y, size, p)),
            None => panic!("No power levels were found"),
        }
    }

    max_levels.sort_by(|a, b| a.3.cmp(&b.3).reverse());

    match max_levels.get(0) {
        Some((x, y, z, _)) => {
            println!("Part 2: {},{},{}", x, y, z);
        }
        None => panic!("No power levels were found"),
    }
}

fn main() {
    let input = 8868;

    solve(input);
}
