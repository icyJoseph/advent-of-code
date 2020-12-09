extern crate one;
use one::find_complement;

pub fn part_one(list: &Vec<i64>) -> i64 {
    let preamble = 25;

    let mut pivot: usize = 0;

    loop {
        let current = list[pivot + preamble];
        let slice = &list[pivot..pivot + preamble].to_vec();
        let complements = find_complement(current, slice);
        if complements.len() == 0 {
            return current;
        }
        pivot = pivot + 1;
    }
}

pub fn part_two(list: &Vec<i64>, weakness: i64) -> i64 {
    let mut start = 0;
    let mut end;

    'outer: loop {
        let slice = &list[start..];
        end = start + 1;
        let mut acc = 0;

        for item in slice {
            acc = acc + item;

            if acc == weakness {
                break 'outer;
            }
            if acc > weakness {
                break;
            }
            end = end + 1;
        }
        start = start + 1;
    }

    let mut it = list[start..end].to_vec();

    it.sort();

    let head = it.first();
    let last = it.last();

    match head {
        Some(h) => match last {
            Some(l) => h + l,
            _ => panic!("No last element"),
        },
        _ => panic!("No head element"),
    }
}
