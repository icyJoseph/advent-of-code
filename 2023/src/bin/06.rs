#[aoc2023::main(06)]
fn main(input: &str) -> (usize, u64) {
    let mut lines = input.lines();

    let Some(time) = lines.next() else {
        panic!("no time");
    };

    let time = time.split(' ').filter_map(|n| n.parse::<usize>().ok());

    let Some(distance) = lines.next() else {
        panic!("no distance");
    };

    let distance = distance.split(' ').filter_map(|n| n.parse::<usize>().ok());

    let race = time.zip(distance);

    let part_one = race.fold(1, |acc, curr| {
        let mut wins = 0;
        for hold in 0..=curr.0 {
            let travels = (curr.0 - hold) * hold;

            if travels > curr.1 {
                wins += 1;
            }
        }

        acc * wins
    });

    let mut lines = input.lines();

    let Some(time) = lines.next() else {
        panic!("no time");
    };

    let Ok(time) = time.replace("Time:", "").replace(' ', "").parse::<u64>() else {
        panic!("Can't parse large time");
    };

    let Some(distance) = lines.next() else {
        panic!("no distance");
    };

    let Ok(distance) = distance
        .replace("Distance:", "")
        .replace(' ', "")
        .parse::<u64>()
    else {
        panic!("Can't parse large distance");
    };

    let part_two = ((time * time - 4 * distance) as f64).sqrt() as u64;

    (part_one, part_two)
}
