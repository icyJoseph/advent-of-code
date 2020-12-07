use std::collections::HashSet;

fn drain_filter(vec: &Vec<Vec<String>>, keys: &Vec<String>, position: usize) -> Vec<Vec<String>> {
    let mut left = vec![];
    for key in keys {
        for item in vec.to_vec().into_iter() {
            let is_match = match item.get(position) {
                Some(n) => n.contains(key),
                _ => false,
            };
            if is_match {
                left.push(item)
            }
        }
    }
    left
}

fn find_while_consume(
    keys: &Vec<String>,
    bags: &Vec<Vec<String>>,
    acc: &mut HashSet<String>,
) -> Vec<String> {
    let left = drain_filter(&bags, keys, 1);

    let next_keys = left
        .into_iter()
        .map(|bag_spec| bag_spec.get(0).unwrap().to_string())
        .collect::<Vec<String>>();

    if next_keys.len() == 0 {
        return next_keys;
    }

    for key in next_keys.to_vec() {
        acc.insert(key);
    }

    find_while_consume(&next_keys, bags, acc)
}

fn compose_while_consume(key: &String, bags: &Vec<Vec<String>>, count_self: bool) -> usize {
    let bag = match bags.into_iter().find(|x| x[0].contains(key)) {
        Some(x) => x,
        _ => panic!("Bag not found"),
    };

    let spec: Vec<String> = match bag.get(1) {
        Some(n) => n
            .split_terminator(",")
            .map(|x| x.trim().to_string().replace("no other", "1"))
            .collect(),
        _ => panic!("No spec found"),
    };

    let mut acc = if count_self { 1 } else { 0 };

    for item in spec {
        let entry: Vec<String> = item
            .splitn(2, " ")
            .map(|x| x.replace(" bag", "").to_string())
            .collect();

        let qty = match entry.get(0) {
            Some(n) => match n.to_string().parse::<usize>() {
                Ok(n) => n,
                _ => panic!("No qty for bag"),
            },
            _ => panic!("No qty for bag"),
        };

        match entry.get(1) {
            Some(k) => acc = acc + qty * (compose_while_consume(k, bags, true)),
            _ => acc = acc,
        };
    }

    return acc;
}

pub fn part_one(bags: &Vec<Vec<String>>) -> usize {
    let mut set = HashSet::new();
    let seed = vec!["shiny gold".to_string()];

    find_while_consume(&seed, bags, &mut set);

    set.len()
}

pub fn part_two(bags: &Vec<Vec<String>>) -> usize {
    compose_while_consume(&"shiny gold".to_string(), bags, false)
}
