use serde_json::Value;
use std::cmp::Ordering::{self, Equal, Greater, Less};

fn compare(left: &Value, right: &Value) -> Ordering {
    match (left, right) {
        (Value::Number(l), Value::Number(r)) => {
            let left_number = l.as_u64().unwrap();
            let right_number = r.as_u64().unwrap();

            return left_number.cmp(&right_number);
        }
        (Value::Array(l), Value::Array(r)) => {
            let mut pointer = 0;

            loop {
                let is_left_over = pointer == l.len();
                let is_right_over = pointer == r.len();

                if is_left_over && is_right_over {
                    return Equal;
                }

                if is_left_over {
                    return Less;
                }

                if is_right_over {
                    return Greater;
                }

                let result = compare(&l[pointer], &r[pointer]);

                if result != Equal {
                    return result;
                }

                pointer += 1;
            }
        }
        (Value::Number(_), Value::Array(_)) => {
            return compare(&Value::from(vec![left.clone()]), right);
        }
        (Value::Array(_), Value::Number(_)) => {
            return compare(left, &Value::from(vec![right.clone()]));
        }
        _ => panic!("Unexpected comparison"),
    }
}

#[aoc2022::main(13)]
fn main(input: &str) -> (usize, usize) {
    let pairs = input
        .split("\n\n")
        .map(|pair| {
            pair.split("\n")
                .map(|packet| {
                    let value: Value = serde_json::from_str(packet).unwrap();

                    return value;
                })
                .collect::<Vec<Value>>()
        })
        .collect::<Vec<Vec<Value>>>();

    let part_one = pairs
        .iter()
        .map(|pair| compare(&pair[0], &pair[1]))
        .enumerate()
        .filter(|(_, result)| *result == Less)
        .map(|(index, _)| index + 1)
        .sum::<usize>();

    let two_marker: Value = serde_json::from_str("[[2]]").unwrap();
    let six_marker: Value = serde_json::from_str("[[6]]").unwrap();

    let mut packets = pairs.iter().flatten().collect::<Vec<_>>();

    packets.push(&two_marker);
    packets.push(&six_marker);

    packets.sort_by(|a, b| compare(a, b));

    let two_pos = packets
        .iter()
        .position(|&packet| packet == &two_marker)
        .unwrap()
        + 1;

    let six_pos = packets
        .iter()
        .position(|&packet| packet == &six_marker)
        .unwrap()
        + 1;

    (part_one, two_pos * six_pos)
}
