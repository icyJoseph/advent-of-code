#[aoc2023::main(01)]
fn main(input: &str) -> (u32, u32) {
    let lines = input.lines();

    let mut part_one = 0;

    for line in lines {
        let mut first: Option<u32> = None;
        let mut last: Option<u32> = None;

        line.chars().for_each(|c| {
            if let Some(digit) = c.to_digit(10) {
                first.get_or_insert(digit);
                last.replace(digit);
            }
        });

        let Some (first) = first else {
            panic!("No first digit");
        };

        let Some (last) = last else {
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
        let mut first: Option<u32> = None;
        let mut last: Option<u32> = None;

        line.chars()
            .enumerate()
            .for_each(|(i, ch)| match ch.to_digit(10) {
                Some(digit) => {
                    first.get_or_insert(digit);
                    last.replace(digit);
                }
                _ => {
                    for &(digit, word) in &words {
                        let upper = i + word.len();

                        if line.len() < upper {
                            continue;
                        }

                        if word != &line[i..upper] {
                            continue;
                        }

                        first.get_or_insert(digit);
                        last.replace(digit);

                        break;
                    }
                }
            });

        let Some (first) = first else {
            panic!("No first digit");
        };

        let Some (last) = last else {
            panic!("No last digit");
        };

        part_two += first * 10 + last;
    }

    (part_one, part_two)
}
