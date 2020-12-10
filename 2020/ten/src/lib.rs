pub fn part_one(sorted_adapter: &Vec<i64>) -> i64 {
    let max = sorted_adapter.last().unwrap() + 3;
    let mut counter = [0, 0, 0, 0];
    let mut peekable = sorted_adapter.iter().peekable();
    let mut current = 0;

    loop {
        match peekable.peek() {
            Some(&next) => {
                let index = (next - current) as usize;
                counter[index] = counter[index] + 1
            }
            _ => {
                let index = (max - current) as usize;
                counter[index] = counter[index] + 1;
                break;
            }
        }
        current = match peekable.next() {
            Some(&n) => n,
            None => continue,
        };
    }

    counter[3] * counter[1]
}

fn factor_lookup(size: usize) -> i64 {
    match size {
        1 | 2 => 1,
        3 => 2,
        4 => 4,
        5 => 7,
        _ => panic!("Impossible"),
    }
}

pub fn part_two(sorted_adapter: &Vec<i64>) -> i64 {
    let mut peekable = sorted_adapter.iter().peekable();

    let mut current = 0;
    let mut factors: Vec<Vec<i64>> = vec![];
    loop {
        match peekable.peek() {
            Some(&next) => {
                if next - current == 3 {
                    factors.push(vec![]);
                }
                let mut last = match factors.pop() {
                    Some(v) => v,
                    _ => vec![current],
                };

                last.push(*next);
                factors.push(last);
            }
            _ => break,
        }
        current = match peekable.next() {
            Some(&n) => n,
            None => continue,
        };
    }

    factors
        .into_iter()
        .fold(1, |prev, curr| prev * factor_lookup(curr.len()))
}
