fn total(left: &[usize], right: &[usize]) -> bool {
    left[0] <= right[0] && right[1] <= left[1]
}

fn partial(left: &[usize], right: &[usize]) -> bool {
    right[0] <= left[1] && right[1] >= left[0]
}

#[aoc2022::main(04)]
fn main(input: &str) -> (usize, usize) {
    let groups = || {
        input.split_terminator('\n').map(|row| {
            row.split(',')
                .map(|range| {
                    range
                        .split('-')
                        .map(|ch| ch.parse::<usize>().unwrap())
                        .collect::<Vec<_>>()
                })
                .collect::<Vec<_>>()
        })
    };

    let part_one = groups()
        .filter(|group| total(&group[0], &group[1]) || total(&group[1], &group[0]))
        .count();

    let part_two = groups()
        .filter(|group| partial(&group[0], &group[1]) || partial(&group[1], &group[0]))
        .count();

    (part_one, part_two)
}
