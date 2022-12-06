#[aoc2022::main(06)]
fn main(input: &str) -> (usize, usize) {
    let signals = input.chars().collect::<Vec<_>>();

    use std::collections::HashSet;

    let find_marker_end = |data: &[char], size: usize| match data.windows(size).position(|sub| {
        let unique: HashSet<_> = sub.iter().copied().collect();

        unique.len() == size
    }) {
        Some(p) => size + p,
        _ => panic!("Cannot find marker"),
    };

    (find_marker_end(&signals, 4), find_marker_end(&signals, 14))
}
