fn binary_partition(current: [usize; 2], direction: char) -> [usize; 2] {
    match direction {
        'F' | 'L' => [current[0], (current[0] + current[1]) / 2],
        'B' | 'R' => [(current[0] + current[1]) / 2 + 1, current[1]],
        _ => panic!("Unexpected direction"),
    }
}

pub fn partition(directions: String) -> usize {
    let chars: Vec<char> = directions.chars().collect();
    let rows_directions = &chars[0..7];
    let columns_directions = &chars[7..];

    let row = *match rows_directions
        .iter()
        .fold([0, 127], |prev, curr| binary_partition(prev, *curr))
        .get(0)
    {
        Some(head) => head,
        _ => panic!("No row found"),
    };

    let col = *match columns_directions
        .iter()
        .fold([0, 7], |prev, curr| binary_partition(prev, *curr))
        .get(0)
    {
        Some(head) => head,
        _ => panic!("No row found"),
    };
    row * 8 + col
}

pub fn part_one(boarding_passes: &Vec<String>) -> usize {
    let mut seats = boarding_passes
        .into_iter()
        .map(|directions| partition(directions.to_string()))
        .collect::<Vec<usize>>();

    seats.sort_by(|a, b| b.partial_cmp(&a).unwrap());

    match seats.get(0) {
        Some(&n) => n,
        _ => panic!("Error sorting boarding passes by seat_id"),
    }
}

pub fn part_two(boarding_passes: &Vec<String>) -> usize {
    let mut seats: Vec<usize> = boarding_passes
        .into_iter()
        .map(|directions| partition(directions.to_string()))
        .collect();

    seats.sort_by(|a, b| b.partial_cmp(&a).unwrap());

    let mut it = seats.into_iter().peekable();

    loop {
        let current = it.next().unwrap();
        match it.peek() {
            Some(&next) => {
                if next == current - 1 {
                    continue;
                }
                return current - 1;
            }
            _ => panic!("Ran to the end of seats"),
        }
    }
}

#[test]
fn test_binary_partition() {
    assert_eq!(binary_partition([0, 127], 'F'), [0, 63]);
    assert_eq!(binary_partition([0, 63], 'B'), [32, 63]);
    assert_eq!(binary_partition([32, 63], 'F'), [32, 47]);
    assert_eq!(binary_partition([32, 47], 'B'), [40, 47]);
    assert_eq!(binary_partition([40, 47], 'B'), [44, 47]);
    assert_eq!(binary_partition([44, 47], 'F'), [44, 45]);

    assert_eq!(binary_partition([0, 7], 'R'), [4, 7]);
    assert_eq!(binary_partition([4, 7], 'L'), [4, 5]);
    assert_eq!(binary_partition([4, 5], 'R'), [5, 5]);
}
