fn to_digits(num: usize) -> Vec<usize> {
    let mut digits = vec![];
    let mut dec = num;

    loop {
        if dec >= 10 {
            digits.push(dec % 10);
            dec = dec / 10;
        } else {
            digits.push(dec);
            break;
        }
    }

    digits.reverse();

    digits
}

#[test]
fn break_to_digits() {
    assert_eq!(to_digits(123), [1, 2, 3]);
    assert_eq!(to_digits(100), [1, 0, 0]);
    assert_eq!(to_digits(8), [8]);
}

fn solve(base: usize) -> () {
    let mut recipes = vec![3, 7, 1, 0];

    let mut a = 0usize;
    let mut b = 1usize;

    loop {
        let c_a = recipes[a];
        let c_b = recipes[b];

        for d in to_digits(c_a + c_b) {
            recipes.push(d);
        }

        a = (a + 1 + c_a) % recipes.len();
        b = (b + 1 + c_b) % recipes.len();

        if recipes.len() >= base + 10 {
            break;
        }
    }

    let next_ten = &recipes[base..base + 10];

    println!(
        "Part 1: {}",
        next_ten
            .iter()
            .map(|x| x.to_string())
            .collect::<Vec<_>>()
            .join("")
    );
}

fn main() {
    let input = 909441;
    solve(input);
}
