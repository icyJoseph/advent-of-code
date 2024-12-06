use std::collections::HashMap;

#[aoc2024::main(01)]
fn main(input: &str) -> (i32, i32) {
    let mut left: Vec<i32> = Vec::new();
    let mut right: Vec<i32> = Vec::new();

    input.lines().for_each(|row| {
        let mut result = row
            .split_whitespace()
            .filter_map(|value| value.parse::<i32>().ok());

        let Some(first) = result.next() else {
            panic!("foo")
        };

        left.push(first);

        let Some(second) = result.next() else {
            panic!("foo")
        };

        right.push(second);
    });

    left.sort();
    right.sort();

    let mut freqs: HashMap<i32, i32> = HashMap::new();

    for n in right.iter() {
        freqs.entry(*n).and_modify(|c| *c += 1).or_insert(1);
    }

    let p1 = left
        .iter()
        .zip(right)
        .map(|(a, b)| (a - b).abs())
        .sum::<i32>();

    let p2 = left
        .iter()
        .map(|&n| n * freqs.get(&n).unwrap_or(&0))
        .sum::<i32>();

    (p1, p2)
}
