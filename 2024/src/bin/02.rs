fn validate_row<It>(nums: It) -> bool
where
    It: Iterator<Item = isize>,
{
    let mut sign: Option<isize> = None;
    let mut peekable = nums.peekable();

    loop {
        let lhs = peekable.next();
        let rhs = peekable.peek();

        match (lhs, rhs) {
            (Some(lhs), Some(rhs)) => {
                let diff = rhs - lhs;

                match sign {
                    None => {
                        sign = Some(diff.signum());
                    }
                    Some(value) if value != diff.signum() => {
                        return false;
                    }

                    _ => {}
                }

                let abs_diff = diff.abs();

                if abs_diff <= 0 || 4 <= abs_diff {
                    return false;
                }
            }
            _ => break,
        };
    }
    true
}

#[aoc2024::main(02)]
fn main(input: &str) -> (usize, usize) {
    let p1 = input
        .lines()
        .filter(|line| {
            let nums = line
                .split_whitespace()
                .filter_map(|d| d.parse::<isize>().ok());

            validate_row(nums)
        })
        .count();

    let p2 = input
        .lines()
        .filter(|line| {
            let nums = line
                .split_whitespace()
                .filter_map(|d| d.parse::<isize>().ok());

            let is_valid = validate_row(nums.clone());

            if is_valid {
                return true;
            }

            for (index, _) in nums.clone().enumerate() {
                let local = nums
                    .clone()
                    .enumerate()
                    .filter(|(pos, _)| *pos != index)
                    .map(|(_, value)| value);

                let is_valid = validate_row(local);

                if is_valid {
                    return true;
                } else {
                    continue;
                }
            }

            false
        })
        .count();

    (p1, p2)
}
