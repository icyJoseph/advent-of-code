pub fn solve(raw_input: String) -> () {
    let input = raw_input.trim();

    let freqs = input
        .split("\n")
        .map(|x| x.to_string())
        .collect::<Vec<String>>();

    let mut part_one = 0;

    for freq in &freqs {
        match freq.parse::<i32>() {
            Ok(x) => part_one += x,
            Err(_) => panic!("Can't parse: {}", freq),
        }
    }

    println!("Part 1: {:?}", part_one);

    let mut part_two = 0;

    use std::collections::HashSet;

    let mut history: HashSet<i32> = HashSet::new();

    let mut unstable = true;

    while unstable {
        for freq in &freqs {
            match freq.parse::<i32>() {
                Ok(x) => {
                    part_two += x;

                    if history.contains(&part_two) {
                        unstable = false;
                        break;
                    }

                    history.insert(part_two);
                }
                Err(_) => panic!("Can't parse: {}", freq),
            }
        }
    }

    println!("Part 2: {:?}", part_two);
}
