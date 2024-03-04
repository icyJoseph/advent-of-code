fn extract_deltas(vec: &[i32]) -> Vec<i32> {
    let mut result = vec![];

    let mut it = vec.iter();

    let Some(mut prev) = it.next() else {
        panic!("No elements");
    };

    for n in it {
        result.push(n - prev);
        prev = n;
    }

    result
}

#[aoc2023::main(09)]
fn main(input: &str) -> (i32, i32) {
    let mut part_one = 0;
    let mut part_two = 0;

    for row in input.lines() {
        let values = row
            .split(" ")
            .filter_map(|c| c.parse::<i32>().ok())
            .collect::<Vec<_>>();

        let mut deltas: Vec<Vec<i32>> = vec![values];

        loop {
            let Some(last) = deltas.last() else {
                panic!("empty deltas");
            };

            let local_deltas = extract_deltas(last);

            let should_break = local_deltas.iter().all(|&x| x == 0);

            deltas.push(local_deltas);

            if should_break {
                break;
            }
        }

        let depth = deltas.len();

        for level in (0..depth).rev() {
            if level == depth - 1 {
                continue;
            }

            let prev_last = deltas[level + 1][deltas[level + 1].len() - 1];

            let last = deltas[level][deltas[level].len() - 1];

            deltas[level].push(last + prev_last);

            let prev_first = deltas[level + 1][0];
            let first = deltas[level][0];

            deltas[level].insert(0, first - prev_first);
        }

        part_one += deltas[0][deltas[0].len() - 1];
        part_two += deltas[0][0];
    }

    (part_one, part_two)
}
