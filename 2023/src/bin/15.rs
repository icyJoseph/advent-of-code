#[derive(Debug)]
struct State(u32);

impl State {
    fn new() -> Self {
        State(0)
    }

    fn hash(&mut self, ch: char) -> &mut Self {
        let code = ch as u32;

        self.0 += code;
        self.0 *= 17;
        self.0 %= 256;

        self
    }
}

#[aoc2023::main(15)]
fn main(input: &str) -> (u32, usize) {
    let steps = input.split(',');

    let mut part_one = 0;

    for step in steps {
        let mut state = State::new();
        for ch in step.chars() {
            state.hash(ch);
        }

        part_one += state.0;
    }

    (part_one, 0)
}
