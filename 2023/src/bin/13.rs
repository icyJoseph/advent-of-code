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

enum Slice {
    Row,
    Col,
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

    fn find_reflection_index(&self, at: usize, line: Slice, skip: Option<usize>) -> Option<usize> {
        match skip {
            Some(index) if at == index => {
                // noop
            }
            _ => {
                let total = match line {
                    Slice::Row => self.rows,
                    Slice::Col => self.cols,
                };

                if at == total {
                    return None;
                }

                let tail_count = total - at - 1;
                let head_count = at + 1;

                let count = min(head_count, tail_count);

                let from = head_count - count;
                let to = at + count;

                let result = match line {
                    Slice::Row => self.slice_rows(from, to),
                    Slice::Col => self.slice_cols(from, to),
                };

                if result {
                    return Some(at);
                }
            }
        }

        self.find_reflection_index(at + 1, line, skip)
    }

    fn find_reflection(
        &self,
        skip_row: Option<usize>,
        skip_col: Option<usize>,
    ) -> (Option<usize>, Option<usize>) {
        let row = self.find_reflection_index(0, Slice::Row, skip_row);
        let col = self.find_reflection_index(0, Slice::Col, skip_col);

        (row, col)
    }

    fn score_reflection(&self) -> usize {
        let (row, col) = self.find_reflection(None, None);

        Mirror::score(row, col)
    }

    fn score(row: Option<usize>, col: Option<usize>) -> usize {
        match (row, col) {
            (Some(r), None) => (r + 1) * 100,
            (None, Some(c)) => c + 1,
            _ => panic!("No reflection!"),
        }
    }

    fn with_smudge(&mut self) -> usize {
        let (row, col) = self.find_reflection(None, None);

        for r in 0..self.rows {
            for c in 0..self.cols {
                let current = self.data[r][c];

                self.data[r][c] = if current == '#' { '.' } else { '#' };

                let (rr, cc) = self.find_reflection(row, col);

                self.data[r][c] = current;

                match (rr, cc) {
                    (None, None) => {
                        continue;
                    }
                    _ => return Mirror::score(rr, cc),
                }
            }
        }

        panic!("No new reflection!");
    }
}

#[aoc2023::main(13)]
fn main(input: &str) -> (usize, usize) {
    let mut part_one = 0;

    for line in input.split("\n\n") {
        let mirror = Mirror::new(line);

        let result = mirror.score_reflection();

        part_one += result;
    }

    let mut part_two = 0;

    for line in input.split("\n\n") {
        let mut mirror = Mirror::new(line);

        let result = mirror.with_smudge();

        part_two += result;
    }

    (part_one, part_two)
}
