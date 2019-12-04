pub fn rule_one(digits: &Vec<u32>) -> bool {
    digits.len() == 6
}

pub fn bunch_check(
    digit: &u32,
    behind: Option<&u32>,
    next: Option<&u32>,
    last: Option<&u32>,
) -> bool {
    if let Some(behind_pivot) = behind {
        if let Some(next_pivot) = next {
            let partial = *digit != *behind_pivot && *digit == *next_pivot;
            if let Some(last_pivot) = last {
                let matches = partial && *digit != *last_pivot;
                if matches {
                    return true;
                }
            } else {
                if partial {
                    return true;
                }
            }
        }
    }
    return false;
}

pub fn strict_rule_two(digits: &Vec<u32>) -> bool {
    let mut cloned = digits.clone();
    cloned.insert(0, 0);
    for (index, digit) in cloned.iter().enumerate() {
        let behind_index = if index == 0 { 0 } else { index - 1 };
        let behind = cloned.get(behind_index);
        let next = cloned.get(index + 1);
        let last = cloned.get(index + 2);

        if bunch_check(digit, behind, next, last) {
            return true;
        }
    }
    return false;
}

pub fn some<T>(vector: &Vec<T>, predicate: fn(&T, usize, &Vec<T>) -> bool) -> bool {
    for (index, item) in vector.iter().enumerate() {
        if predicate(item, index, vector) {
            return true;
        }
    }
    return false;
}

pub fn every<T>(vector: &Vec<T>, predicate: fn(&T, usize, &Vec<T>) -> bool) -> bool {
    for (index, item) in vector.iter().enumerate() {
        if !predicate(item, index, vector) {
            return false;
        } else {
            continue;
        }
    }
    return true;
}

pub fn next_to_equal(digit: &u32, index: usize, digits: &Vec<u32>) -> bool {
    let next = digits.get(index + 1);
    if let Some(val) = next {
        if *val == *digit {
            return true;
        }
    }
    return false;
}

pub fn rule_two(digits: &Vec<u32>) -> bool {
    some::<u32>(&digits, next_to_equal)
}

pub fn increments(digit: &u32, index: usize, digits: &Vec<u32>) -> bool {
    let next = digits.get(index + 1).or(Some(&digit)).unwrap();
    return *digit <= *next;
}

pub fn rule_three(digits: &Vec<u32>) -> bool {
    every::<u32>(&digits, increments)
}

pub fn number_to_digits(number: u32) -> Vec<u32> {
    number
        .to_string()
        .chars()
        .map(|x| x.to_digit(10).unwrap())
        .collect()
}

pub fn find_numbers(lower: u32, upper: u32) -> (usize, usize) {
    let funcs = [rule_one, rule_two, rule_three];
    let stric = [rule_one, strict_rule_two, rule_three];

    let mut problem_one = 0;
    let mut problem_two = 0;

    for number in lower..=upper {
        let digits: Vec<u32> = number_to_digits(number);

        if funcs.iter().fold(true, |prev, curr| prev && curr(&digits)) {
            problem_one = problem_one + 1;
        }

        if stric.iter().fold(true, |prev, curr| prev && curr(&digits)) {
            problem_two = problem_two + 1
        }
    }

    return (problem_one, problem_two);
}
