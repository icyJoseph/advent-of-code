#[aoc2022::main(01)]
fn main(input: &str) -> (usize, usize) {
    let mut cals: Vec<usize> = input
        .split("\n\n")
        .map(|chunk| {
            chunk
                .split('\n')
                .map(|cal| cal.parse::<usize>().unwrap())
                .sum::<usize>()
        })
        .collect();

    cals.sort_by(|a, b| a.cmp(b).reverse());

    (cals[0], cals[..3].iter().sum())
}
