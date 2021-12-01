use aoc;

fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}

fn solve(raw: String) -> () {
    let rows = raw
        .trim()
        .split("\n")
        .map(|x| parse_num::<u32>(x))
        .collect::<Vec<u32>>();

    let mut part_one_deltas = 0;

    for (index, value) in rows[1..].iter().enumerate() {
        let actual_index = index + 1;
        if *value > rows[actual_index - 1] {
            part_one_deltas += 1;
        }
    }
    println!("Part one: {}", part_one_deltas); // 1226

    let mut part_two_deltas = 0;
    for (index, _) in rows[1..rows.len() - 2].iter().enumerate() {
        let actual_index = index + 1;
        let prev_window = rows[actual_index - 1..actual_index + 2].iter().sum::<u32>();
        let next_window = rows[actual_index..actual_index + 3].iter().sum::<u32>();

        if next_window > prev_window {
            part_two_deltas += 1;
        }
    }
    println!("Part two: {}", part_two_deltas); // 1252
}

fn main() {
    let input = aoc::get_input(2021, 1);

    // let example_input = std::fs::read_to_string("./input/day-1.in").expect("Error reading input");

    solve(input);
    // solve(example_input);
}
