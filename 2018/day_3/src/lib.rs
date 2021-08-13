#[derive(Debug)]
struct Area {
    id: String,
    x: u32,
    y: u32,
    width: u32,
    height: u32,
}

impl Area {
    fn new(raw: &String) -> Self {
        let spec = raw
            .split("@")
            .map(|x| x.to_string())
            .collect::<Vec<String>>();

        let id = spec[0].trim().to_string();

        let geometry = spec[1]
            .split(":")
            .map(|x| x.to_string().trim().to_string())
            .collect::<Vec<String>>();

        let coords = geometry[0]
            .split(",")
            .map(|x| x.to_string().parse::<u32>().unwrap())
            .collect::<Vec<u32>>();

        let dimensions = geometry[1]
            .split("x")
            .map(|x| x.to_string().parse::<u32>().unwrap())
            .collect::<Vec<u32>>();

        return Area {
            id,
            x: coords[0],
            y: coords[1],
            width: dimensions[0],
            height: dimensions[1],
        };
    }
}

pub fn solve(raw_input: String) {
    let input = raw_input.trim();
    let entries = input
        .split("\n")
        .map(|x| x.to_string())
        .collect::<Vec<String>>();

    let areas = entries.iter().map(|x| Area::new(x)).collect::<Vec<Area>>();

    use std::collections::HashMap;

    let mut table: HashMap<String, u32> = HashMap::new();

    for area in &areas {
        for dx in 0..area.width {
            for dy in 0..area.height {
                let key = format!("{}.{}", area.x + dx, area.y + dy);
                *table.entry(key).or_insert(0) += 1;
            }
        }
    }

    let mut part_one = 0;

    for square in &table {
        if *square.1 > 1 {
            part_one += 1;
        }
    }

    println!("Part 1: {}", part_one);

    let search = || {
        for area in &areas {
            let mut is_most_wanted = true;
            for dx in 0..area.width {
                for dy in 0..area.height {
                    let key = format!("{}.{}", area.x + dx, area.y + dy);
                    let value = match table.get(&key) {
                        Some(&n) => n,
                        None => panic!("Key was not counted: {}", key),
                    };

                    if value > 1 {
                        is_most_wanted = false;
                        break;
                    }
                }
            }

            if is_most_wanted {
                return Some(area.id.to_string());
            }
        }

        None
    };

    match search() {
        Some(part_two) => println!("Part 2: {}", part_two),
        None => panic!("No solution found"),
    }
}
