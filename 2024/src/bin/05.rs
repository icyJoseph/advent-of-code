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

    let mut invalid_printers = vec![];

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
        } else {
            invalid_printers.push(printer);
        }
    }

    let mut p2 = 0;

    for printer in invalid_printers.iter_mut() {
        loop {
            let mut did_swap = false;

            for (before, after) in rules.iter() {
                let before_pos = printer.iter().position(|c| c == before);
                let after_pos = printer.iter().position(|c| c == after);

                match (before_pos, after_pos) {
                    (Some(b), Some(a)) if a < b => {
                        printer.swap(a, b);
                        did_swap = true;
                    }
                    _ => continue,
                }
            }

            if !did_swap {
                break;
            }
        }

        if let Ok(middle) = printer[printer.len() / 2].parse::<usize>() {
            p2 += middle;
        }
    }

    (p1, p2)
}
