use std::collections::{HashMap, HashSet};

pub fn part_one(groups: &Vec<String>) -> usize {
    groups
        .into_iter()
        .fold(vec![], |mut prev, curr| {
            if curr.is_empty() {
                prev.push("".to_string());
                return prev;
            }
            let last = match prev.pop() {
                Some(n) => n,
                _ => "".to_string(),
            };

            let mut unique = HashSet::new();

            let mut current_group: Vec<char> = curr.chars().collect();
            let mut last_group: Vec<char> = last.chars().collect();
            current_group.append(&mut last_group);

            for item in &current_group {
                unique.insert(item);
            }

            let next = unique.into_iter().map(|x| *x).collect::<String>();

            prev.push(next);
            return prev;
        })
        .join("")
        .len()
}

pub fn part_two(groups: &Vec<String>) -> usize {
    groups
        .into_iter()
        .fold(vec![], |mut prev, curr| {
            if curr.is_empty() {
                prev.push(vec![]);
                return prev;
            }
            let mut last = match prev.pop() {
                Some(n) => n,
                _ => vec![],
            };

            let current_group: Vec<char> = curr.chars().collect();
            last.push(current_group);
            prev.push(last);
            prev
        })
        .into_iter()
        .map(|group| {
            let mut hash = HashMap::new();

            &group.iter().flatten().for_each(|curr| {
                hash.entry(curr).and_modify(|x| *x += 1).or_insert(1);
            });

            let mut valid = 0;

            for (_, v) in &hash {
                if *v == group.len() {
                    valid = valid + 1
                }
            }
            valid
        })
        .fold(0, |acc, curr| acc + curr)
}
