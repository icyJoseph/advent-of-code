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

    let part_one_deltas = rows[1..]
        .iter()
        .scan(rows[0], |state, curr| {
            let diff = curr > state;

            *state = *curr;

            Some(diff)
        })
        .filter(|x| *x)
        .count();

    println!("Part one: {}", part_one_deltas); // 1226

    let windows: Vec<u32> = rows[..rows.len() - 2]
        .iter()
        .scan(0usize, |state, curr| {
            let window_sum = curr + rows[*state + 1..*state + 3].iter().sum::<u32>();
            *state += 1;

            Some(window_sum)
        })
        .collect();

    let part_two_deltas = windows[1..]
        .iter()
        .scan(0usize, |state, curr| {
            let index = *state;
            *state += 1;
            Some(*curr > windows[index])
        })
        .filter(|x| *x)
        .count();
    println!("Part two: {}", part_two_deltas); // 1252
}

fn main() {
    let input = aoc::get_input(2021, 1);

    solve(input);
}
