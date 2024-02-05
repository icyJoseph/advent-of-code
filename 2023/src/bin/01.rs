#[aoc2023::main(01)]
fn main(input: &str) -> (u32, u32) {
    let mut part_one = 0;
    let mut part_two = 0;

    let words: Vec<(u32, &str)> = "one, two, three, four, five, six, seven, eight, nine"
        .split(", ")
        .enumerate()
        .map(|(v, word)| (v as u32 + 1, word))
        .collect();

    for line in input.lines() {
        let mut p1_first: Option<u32> = None;
        let mut p1_last: Option<u32> = None;

        let mut p2_first: Option<u32> = None;
        let mut p2_last: Option<u32> = None;

        for (i, ch) in line.chars().enumerate() {
            match ch {
                '1'..='9' => {
                    let digit = ch.to_digit(10).unwrap();
                    p1_first.get_or_insert(digit);
                    p1_last.replace(digit);

                    p2_first.get_or_insert(digit);
                    p2_last.replace(digit);
                }
                'o' | 't' | 'f' | 's' | 'e' | 'n' => {
                    for &(digit, word) in &words {
                        if line[i..].starts_with(word) {
                            p2_first.get_or_insert(digit);
                            p2_last.replace(digit);
                            break;
                        }
                    }
                }
                _ => {}
            };
        }

        let Some(p1_first) = p1_first else {
            panic!("No first digit");
        };

        let Some(p1_last) = p1_last else {
            panic!("No last digit");
        };
        let Some(p2_first) = p2_first else {
            panic!("No first digit");
        };

        let Some(p2_last) = p2_last else {
            panic!("No last digit");
        };

        part_one += p1_first * 10 + p1_last;
        part_two += p2_first * 10 + p2_last;
    }

    (part_one, part_two)
}
