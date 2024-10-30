use std::cmp::min;

#[derive(Debug)]
struct Mirror {
    cols: usize,
    rows: usize,
    data: Vec<Vec<char>>,
}

fn is_palindrome(line: &[char]) -> bool {
    if line.len() == 0 {
        return false;
    }

    let mut it = line.iter();

    for _ in 0..line.len() / 2 {
        let lhs = it.next();
        let rhs = it.next_back();

        if lhs != rhs {
            return false;
        }
    }

    true
}

impl Mirror {
    fn new(desc: &str) -> Mirror {
        let data: Vec<_> = desc
            .lines()
            .map(|l| l.chars().collect::<Vec<_>>())
            .collect::<_>();

        let cols = data[0].len();

        let rows = data.len();

        Mirror { cols, rows, data }
    }

    fn slice_rows(&self, from: usize, to: usize) -> bool {
        for i in 0..self.cols {
            let slice = self.data[from..=to]
                .iter()
                .filter_map(|r| r.get(i))
                .copied()
                .collect::<Vec<_>>();

            if !is_palindrome(&slice) {
                return false;
            }
        }

        true
    }

    fn slice_cols(&self, from: usize, to: usize) -> bool {
        for row in &self.data {
            if !is_palindrome(&row[from..=to]) {
                return false;
            }
        }

        true
    }

    fn find_col_reflection(&self, at: usize) -> Option<usize> {
        if at == self.cols {
            return None;
        }

        let tail_count = self.cols - at - 1;
        let head_count = at + 1;

        let count = min(head_count, tail_count);

        if self.slice_cols(head_count - count, at + count) {
            return Some(at);
        }

        self.find_col_reflection(at + 1)
    }

    fn find_row_reflection(&self, at: usize) -> Option<usize> {
        if at == self.rows {
            return None;
        }

        let tail_count = self.rows - at - 1;
        let head_count = at + 1;

        let count = min(head_count, tail_count);

        if self.slice_rows(head_count - count, at + count) {
            return Some(at);
        }

        self.find_row_reflection(at + 1)
    }

    fn find_reflection(&self) -> usize {
        let row = self.find_row_reflection(0);
        let col = self.find_col_reflection(0);

        match (row, col) {
            (Some(r), None) => (r + 1) * 100,
            (None, Some(c)) => c + 1,
            _ => 0, //panic!("No reflection!"),
        }
    }
}

#[aoc2023::main(13)]
fn main(input: &str) -> (usize, usize) {
    let mut part_one = 0;

    for line in input.split("\n\n") {
        let mirror = Mirror::new(line);

        let result = mirror.find_reflection();

        part_one += result;
    }

    (part_one, 0)
}
