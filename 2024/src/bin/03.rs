fn parse_mul(chars: &[char]) -> (Vec<usize>, usize) {
    let mut result = vec![];
    let mut current = None;
    let mut end = 0;

    for (index, &ch) in chars.iter().enumerate() {
        if let Some(digit) = ch.to_digit(10) {
            let d = digit as usize;
            match current {
                Some(acc) => current = Some(acc * 10 + d),
                None => current = Some(d),
            }
        } else {
            if ch == ')' {
                result.push(current);
                end = index;
                break;
            }
            if ch == ',' {
                result.push(current);
                current = None;
                continue;
            }
            end = index;
            return (vec![], end);
        }
    }

    (result.iter().filter_map(|c| *c).collect::<Vec<_>>(), end)
}

const DO: &str = "do()";
const DO_NOT: &str = "don't()";
const MUL: &str = "mul(";

fn parse_input(input: &str, always_allowed: bool) -> usize {
    let chars = input.chars().collect::<Vec<char>>();

    let mut index = 0;
    let mut allowed = true;
    let mut result = 0;

    loop {
        if index == chars.len() {
            break;
        }

        let mut upper = index + 4;

        if upper >= chars.len() {
            break;
        }

        let maybe_mul = chars[index..upper].iter().collect::<String>();

        if maybe_mul == MUL {
            let (factors, end) = parse_mul(&chars[upper..]);

            let should_add_product = always_allowed || allowed;

            if should_add_product && factors.len() == 2 {
                result += factors.iter().product::<usize>();
            }
            index += end + 1;

            continue;
        }

        let maybe_do = chars[index..upper].iter().collect::<String>();

        if maybe_do == DO {
            index = upper;
            allowed = true;
            continue;
        }

        upper = index + 7;

        if upper >= chars.len() {
            break;
        }

        let maybe_do_not = chars[index..upper].iter().collect::<String>();

        if maybe_do_not == DO_NOT {
            index = upper;
            allowed = false;
            continue;
        }

        index += 1;
    }

    result
}

#[aoc2024::main(03)]
fn main(input: &str) -> (usize, usize) {
    let p1 = parse_input(input, true);
    let p2 = parse_input(input, false);
    (p1, p2)
}
