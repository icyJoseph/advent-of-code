const fn mapper(value: u64, rule: (u64, u64, u64)) -> u64 {
    let (dest, from, size) = rule;

    if from <= value && value < (from + size) {
        return dest + value - from;
    }

    value
}

fn expand_range(range: (u64, u64, bool), rule: &[u64]) -> Vec<(u64, u64, bool)> {
    let (from, to, done) = range;

    if done {
        return vec![range];
    }

    let source = rule[1];
    let length = rule[2];

    let lower = source;
    let upper = source + length - 1;

    if to < lower {
        return vec![(from, to, false)];
    }

    let rule = (rule[0], rule[1], rule[2]);

    if lower <= to && to <= upper {
        if from < lower {
            return vec![
                (from, lower - 1, false),
                (mapper(lower, rule), mapper(to, rule), true),
            ];
        }

        return vec![(mapper(from, rule), mapper(to, rule), true)];
    }

    if from < lower {
        return vec![
            (from, lower - 1, false),
            (mapper(lower, rule), mapper(upper, rule), true),
            (upper + 1, to, false),
        ];
    }

    if from < upper {
        return vec![
            (mapper(from, rule), mapper(upper, rule), true),
            (upper + 1, to, false),
        ];
    }

    vec![(from, to, false)]
}

#[aoc2023::main(05)]
fn main(input: &str) -> (u64, u64) {
    let mut lines = input.lines();

    let Some(seeds) = lines.next() else {
        panic!("Missing seeds");
    };

    let seeds: Vec<u64> = seeds
        .split(' ')
        .filter_map(|n| n.parse::<u64>().ok())
        .collect();

    let mut groups: Vec<Vec<Vec<u64>>> = vec![];

    while let Some(row) = lines.next() {
        if row.is_empty() {
            continue;
        }

        if row.ends_with("map:") {
            continue;
        }

        let mut local_rules: Vec<Vec<u64>> = vec![];

        let rule = row
            .split(' ')
            .filter_map(|n| n.parse::<u64>().ok())
            .collect::<Vec<u64>>();

        local_rules.push(rule);

        for line in lines.by_ref() {
            if line.is_empty() {
                break;
            }

            let rule = line
                .split(' ')
                .filter_map(|n| n.parse::<u64>().ok())
                .collect::<Vec<u64>>();

            local_rules.push(rule);
        }

        groups.push(local_rules);
    }

    let mut part_one = u64::MAX;

    use std::cmp::min;

    for seed in seeds.iter() {
        // consume the groups...
        let mut value = *seed;

        for group in groups.iter() {
            for rule in group.iter() {
                let destination = rule[0];
                let current = rule[1];
                let size = rule[2];

                if current <= value && value < (current + size) {
                    value = destination + value - current;
                    break;
                }
            }
        }

        part_one = min(part_one, value);
    }

    let mut part_two = u64::MAX;

    for range in seeds.chunks(2) {
        let from = range[0];
        let size = range[1];
        let to = from + size - 1;

        let mut ranges = vec![(from, to, false)];

        for group in groups.iter() {
            for rule in group.iter() {
                let mut local = vec![];

                for range in ranges {
                    for expanded in expand_range(range, rule) {
                        local.push(expanded);
                    }
                }

                ranges = local;
            }

            ranges.iter_mut().for_each(|entry| entry.2 = false);
        }

        ranges.iter().for_each(|r| {
            part_two = min(part_two, r.0);
        })
    }

    (part_one, part_two)
}
