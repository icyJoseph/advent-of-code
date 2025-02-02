#[aoc2024::main(05)]
fn main(input: &str) -> (usize, usize) {
    let Some((rules, printers)) = input.split_once("\n\n") else {
        panic!("Bad input")
    };

    let rules = rules
        .lines()
        .filter_map(|n| n.split_once('|'))
        .collect::<Vec<(_, _)>>();

    let printers = printers
        .lines()
        .map(|r| r.split(',').collect::<Vec<_>>())
        .collect::<Vec<Vec<_>>>();

    let mut p1 = 0;

    for printer in printers {
        let mut correct = true;

        for (index, page) in printer.iter().enumerate() {
            let page_rules = rules.iter().filter(|(key, _)| key == page);

            for (_, after) in page_rules {
                let Some(position) = printer.iter().position(|p| p == after) else {
                    continue;
                };

                if position < index {
                    correct = false;

                    break;
                }
            }

            if !correct {
                break;
            }
        }

        if correct {
            if let Ok(middle) = printer[printer.len() / 2].parse::<usize>() {
                p1 += middle;
            }
        }
    }

    (p1, 0)
}
