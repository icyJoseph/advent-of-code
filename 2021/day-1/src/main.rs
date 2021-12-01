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

    let compare = |state: &mut usize, curr: &u32| {
        let result = *curr > rows[*state];
        *state += 1;

        Some(result)
    };

    let part_one_deltas = rows[1..]
        .iter()
        .scan(0usize, compare)
        .filter(|x| *x)
        .count();

    println!("Part one: {}", part_one_deltas); // 1226

    let part_two_deltas = rows[3..]
        .iter()
        .scan(0usize, compare)
        .filter(|x| *x)
        .count();

    println!("Part two: {}", part_two_deltas); // 1252
}

fn main() {
    let input = aoc::get_input(2021, 1);

    solve(input);
}
