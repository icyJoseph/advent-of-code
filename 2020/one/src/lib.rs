use std::collections::HashSet;

pub fn find_complement(target: i64, list: &Vec<i64>) -> Vec<i64> {
    let set: HashSet<&i64> = list.iter().collect();

    return list
        .into_iter()
        .map(|x| target - x)
        .filter(|x| set.contains(x))
        .collect();
}

pub fn part_one(input: &Vec<i64>) -> i64 {
    let comp = find_complement(2020, input);

    match comp.get(0) {
        Some(x) => x * (2020 - x),
        _ => panic!("No complement"),
    }
}

pub fn part_two(input: &Vec<i64>) -> i64 {
    for first in input.into_iter() {
        let target = 2020 - first;
        let comp = find_complement(target, input);

        match comp.get(0) {
            Some(x) => return first * x * (target - x),
            _ => continue,
        }
    }
    panic!("No complement triplet found");
}
