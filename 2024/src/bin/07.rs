enum OP {
    Sum,
    Mult,
    Concat,
}

fn search(nums: &[u128], target: usize, carry: u128, op: OP, with_concat: bool) -> bool {
    if carry > nums[0] {
        return false;
    }

    if nums.len() == target {
        return carry == nums[0];
    }

    let first = nums[target];

    let next = match op {
        OP::Sum => first + carry,
        OP::Mult => first * carry,
        OP::Concat if with_concat => {
            let mut base = 1;

            while base <= first {
                base *= 10;
            }

            carry * base + first
        }
        _ => carry,
    };

    search(nums, target + 1, next, OP::Sum, with_concat)
        || search(nums, target + 1, next, OP::Mult, with_concat)
        || (with_concat && search(nums, target + 1, next, OP::Concat, with_concat))
}

#[aoc2024::main(07)]
fn main(input: &str) -> (u128, u128) {
    let mut p1 = 0;
    let mut p2 = 0;

    for line in input.lines() {
        let nums = line
            .replace(':', "")
            .split(' ')
            .filter_map(|n| n.parse::<u128>().ok())
            .collect::<Vec<_>>();

        if search(&nums, 0, 0, OP::Sum, false) || search(&nums, 0, 0, OP::Mult, false) {
            p1 += nums[0];
        }

        if search(&nums, 0, 0, OP::Sum, true)
            || search(&nums, 0, 0, OP::Mult, true)
            || search(&nums, 0, 0, OP::Concat, true)
        {
            p2 += nums[0];
        }
    }

    (p1, p2)
}
