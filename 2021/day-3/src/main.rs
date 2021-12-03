use aoc;

fn to_int(bin: &str) -> u32 {
    match u32::from_str_radix(bin, 2) {
        Ok(n) => n,
        _ => panic!("Error parsing binary to integer"),
    }
}

fn string_vec<T: std::string::ToString>(vec: &Vec<T>, separator: &str) -> String {
    vec.iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
        .join(separator)
}

fn solve(raw: String) -> () {
    let binaries = raw
        .trim()
        .split("\n")
        .map(|row| row.chars().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>();

    let binary_length = binaries[0].len();

    let bin_base = (0..binaries[0].len()).collect::<Vec<usize>>();

    let count_all = |index: usize, vec: &Vec<Vec<char>>| {
        vec.iter().fold((0, 0), |prev, row| {
            if row[index] == '1' {
                (prev.0 + 1, prev.1)
            } else {
                (prev.0, prev.1 + 1)
            }
        })
    };

    let gamma = bin_base
        .iter()
        .scan(vec![], |state, current| {
            let (ones, zeros) = count_all(*current, &binaries);
            let next_bit = if ones > zeros { '1' } else { '0' };
            state.push(next_bit);

            Some(to_int(&string_vec(&state, "")))
        })
        .last();

    let epsilon = bin_base
        .iter()
        .scan(vec![], |state, current| {
            let (ones, zeros) = count_all(*current, &binaries);
            let next_bit = if zeros > ones { '1' } else { '0' };
            state.push(next_bit);

            Some(to_int(&string_vec(&state, "")))
        })
        .last();

    match (gamma, epsilon) {
        (Some(g), Some(e)) => {
            println!("Part one: {}", g * e);
        }
        _ => panic!("Gamma or epsilon are incorrect"),
    }

    let mut bit = 0;

    let mut oxygen = binaries.clone();

    loop {
        if oxygen.len() == 1 {
            break;
        }
        let (ones, zeros) = count_all(bit, &oxygen);
        let gt_ones = ones >= zeros;

        oxygen = oxygen
            .into_iter()
            .filter(|row| row[bit] == if gt_ones { '1' } else { '0' })
            .collect::<Vec<Vec<char>>>();

        bit = (bit + 1) % binary_length;
    }

    bit = 0;

    let mut co2 = binaries.clone();

    loop {
        if co2.len() == 1 {
            break;
        }
        let (ones, zeros) = count_all(bit, &co2);
        let gt_zeros = zeros > ones;

        co2 = co2
            .into_iter()
            .filter(|row| row[bit] == if gt_zeros { '1' } else { '0' })
            .collect::<Vec<Vec<char>>>();
        bit = (bit + 1) % binary_length;
    }

    println!(
        "Part Two: {}",
        to_int(&string_vec(&oxygen[0], "")) * to_int(&string_vec(&co2[0], "")),
    );
}

fn main() {
    let input = aoc::get_input(2021, 3);

    solve(input);
}
