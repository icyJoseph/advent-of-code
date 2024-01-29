#[aoc2023::main(01)]
fn main(input: &str) -> (u32, u32) {
    let lines = input.lines();

    let mut part_one = 0;

    for line in lines {
        let digits = line
            .chars()
            .filter_map(|c| c.to_digit(10))
            .collect::<Vec<_>>();

        let Some (first) = digits.first() else {
            panic!("No first digit");
        };

        let Some (last) = digits.last() else {
            panic!("No last digit");
        };

        part_one += first * 10 + last;
    }

    let words: Vec<(u32, &str)> = "one, two, three, four, five, six, seven, eight, nine"
        .split(", ")
        .enumerate()
        .map(|(v, ch)| (v as u32 + 1, ch))
        .collect();

    let mut part_two = 0;

    for line in input.lines() {
        let mut digits = vec![];

        for (i, ch) in line.chars().enumerate() {
            match ch.to_digit(10) {
                Some(digit) => digits.push(digit),
                _ => {
                    for (digit, word) in &words {
                        let upper = i + word.len();

                        if line.len() < upper {
                            continue;
                        }

                        if *word != &line[i..upper] {
                            continue;
                        }

                        digits.push(*digit);

                        break;
                    }
                }
            }
        }

        let Some (first) = digits.first() else {
            panic!("No first digit");
        };

        let Some (last) = digits.last() else {
            panic!("No last digit");
        };

        part_two += first * 10 + last;
    }

    (part_one, part_two)
}
