#[aoc2022::main(05)]
fn main(input: &str) -> (String, String) {
    let blocks = input
        .split_terminator("\n\n")
        .map(|block| block.split_terminator('\n').collect::<Vec<_>>())
        .collect::<Vec<Vec<_>>>();

    let size = blocks[0].len();

    let get_stacks = || {
        blocks[0][..size - 1]
            .iter()
            .map(|row| {
                row.chars()
                    .enumerate()
                    .filter(|(index, _)| index % 4 == 1)
                    .map(|(_, value)| value)
                    .collect::<Vec<_>>()
            })
            .enumerate()
            .fold(vec![vec![' '; size]; size], |mut prev, (dy, curr)| {
                curr.iter()
                    .enumerate()
                    .for_each(|(dx, cell)| prev[dx][size - dy - 2] = *cell);

                prev
            })
            .iter()
            .map(|col| col.iter().copied().filter(|c| !c.is_whitespace()).collect())
            .collect::<Vec<Vec<char>>>()
    };

    let instructions = blocks[1]
        .iter()
        .map(|row| {
            row.split(' ')
                .filter_map(|c| c.parse::<usize>().ok())
                .collect::<Vec<_>>()
        })
        .map(|mov| (mov[0], mov[1] - 1, mov[2] - 1))
        .collect::<Vec<_>>();

    let part_one = instructions
        .iter()
        .fold(get_stacks(), |mut stacks, &inst| {
            let (qty, from, to) = inst;

            let start = stacks[from].len() - qty;

            stacks[from]
                .split_off(start)
                .iter()
                .rev()
                .copied()
                .for_each(|cell| stacks[to].push(cell));

            stacks
        })
        .iter()
        .filter_map(|stack| stack.last())
        .collect::<String>();

    let part_two = instructions
        .iter()
        .fold(get_stacks(), |mut stacks, &inst| {
            let (qty, from, to) = inst;

            let start = stacks[from].len() - qty;

            stacks[from]
                .split_off(start)
                .iter()
                .copied()
                .for_each(|cell| stacks[to].push(cell));

            stacks
        })
        .iter()
        .filter_map(|stack| stack.last())
        .collect::<String>();

    (part_one, part_two)
}
