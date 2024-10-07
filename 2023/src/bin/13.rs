#[derive(Debug)]
struct Mirror<'a> {
    cols: usize,
    rows: usize,
    data: Vec<&'a str>,
}

impl<'a> Mirror<'_> {
    fn new(desc: &'a str) -> Mirror<'a> {
        let data: Vec<&str> = desc.lines().collect();

        let cols = data[0].len();

        let rows = data.len();

        Mirror { cols, rows, data }
    }

    fn slice_rows(&self, from: usize, to: usize, rev: bool) -> String {
        let mut rows = Vec::new();

        for at in from..=to {
            if let Some(row) = self.data.get(at) {
                rows.push(*row);
            }
        }

        if rev {
            rows.reverse();
        }

        rows.join("\n")
    }

    fn slice_cols(&self, from: usize, to: usize, rev: bool) -> String {
        let mut cols = Vec::new();

        for at in from..=to {
            let payload = self
                .data
                .iter()
                .filter_map(|r| r.chars().nth(at))
                .collect::<String>();

            if payload.is_empty() {
                break;
            }

            cols.push(payload)
        }

        if rev {
            cols.reverse();
        }

        cols.join("\n")
    }

    fn find_col_reflection(&self, at: usize) -> Option<usize> {
        if at == self.cols {
            return None;
        }

        let delta = std::cmp::min(at, self.cols - at - 2);

        if self.slice_cols(at - delta, at, false) == self.slice_cols(at + 1, at + 1 + delta, true) {
            return Some(at);
        }

        return self.find_col_reflection(at + 1);
    }

    fn find_row_reflection(&self, at: usize) -> Option<usize> {
        if at == self.rows {
            return None;
        }

        let delta = std::cmp::min(at, self.rows - at - 2);

        if self.slice_rows(at - delta, at, false) == self.slice_rows(at + 1, at + 1 + delta, true) {
            return Some(at);
        }

        return self.find_row_reflection(at + 1);
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
