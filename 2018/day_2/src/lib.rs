#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        assert_eq!(2 + 2, 4);
    }
}

pub fn solve(raw_input: String) -> () {
    let input = raw_input.trim();

    let rows = input
        .split("\n")
        .map(|x| x.to_string())
        .collect::<Vec<String>>();

    use std::collections::HashMap;

    let mut twos = 0;
    let mut threes = 0;

    for pkg in &rows {
        let mut dict: HashMap<char, u32> = HashMap::new();

        for c in pkg.chars() {
            *dict.entry(c).or_insert(0) += 1;
        }

        let freqs = dict.iter().map(|(_, &v)| v).collect::<Vec<u32>>();

        twos += if freqs
            .iter()
            .filter(|&x| *x == 2)
            .collect::<Vec<&u32>>()
            .len()
            > 0
        {
            1
        } else {
            0
        };

        threes += if freqs
            .iter()
            .filter(|&x| *x == 3)
            .collect::<Vec<&u32>>()
            .len()
            > 0
        {
            1
        } else {
            0
        };
    }

    println!("Part 1: {}", twos * threes);

    let boxes = rows
        .iter()
        .map(|x| x.chars().collect())
        .collect::<Vec<Vec<char>>>();

    let search = || {
        for i in 0..boxes.len() {
            let current = &boxes[i];

            for j in 0..boxes.len() {
                if j == i {
                    continue;
                }

                let compare = &boxes[j];

                let mut result = String::new();

                let mut diff = 0;

                for k in 0..current.len() {
                    if current[k] != compare[k] {
                        diff += 1;
                    } else {
                        result.push(current[k]);
                    }

                    if diff > 1 {
                        break;
                    }
                }

                if diff == 1 {
                    return (i, j, result);
                }
            }
        }
        panic!("No match found");
    };

    let (i, j, part_two) = search();

    println!("{:?}", boxes[i]);
    println!("{:?}", boxes[j]);

    println!("Part 2: {}", part_two);
}
