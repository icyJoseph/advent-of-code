pub fn memory_game(input: &Vec<u32>, limit: u32) -> u32 {
    use std::collections::HashMap;
    let mut map: HashMap<u32, (Option<u32>, Option<u32>)> = HashMap::new();

    let mut seed: u32 = 1;

    for num in input.into_iter() {
        map.insert(*num, (None, Some(seed)));
        seed = seed + 1;
    }

    let mut iteration = (input.len() as u32) + 1;
    let mut last = match input.iter().last() {
        Some(&n) => n,
        _ => panic!("Bad input"),
    };

    loop {
        let seq = map.entry(last).or_insert((None, Some(iteration)));

        let speak = match seq {
            (Some(left), Some(right)) => *right - *left,
            _ => 0,
        };

        let current = map.entry(speak).or_insert((None, Some(iteration)));
        current.0 = current.1;
        current.1 = Some(iteration);

        if iteration == limit {
            return speak;
        }

        last = speak;
        iteration = iteration + 1;
    }
}
