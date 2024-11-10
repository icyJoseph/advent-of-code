struct State(usize);

impl State {
    fn new() -> Self {
        State(0)
    }

    fn hash(&mut self, ch: char) -> &mut Self {
        let code = ch as usize;

        self.0 += code;
        self.0 *= 17;
        self.0 %= 256;

        self
    }

    fn hash_word(word: &str) -> usize {
        let mut state = State::new();
        for ch in word.chars() {
            state.hash(ch);
        }

        state.0
    }
}

struct Lense {
    label: String,
    length: usize,
}

impl Lense {
    fn new(label: Option<&str>, focal_length: Option<&str>) -> Self {
        match (label, focal_length) {
            (Some(label), Some(focal_length)) => {
                let Ok(length) = focal_length.parse::<usize>() else {
                    panic!("Invalid focal length");
                };

                Lense {
                    label: label.to_string(),
                    length,
                }
            }
            (_, _) => panic!("Invalid lense inputs"),
        }
    }

    fn new_vec(input: &str) -> Vec<Self> {
        input
            .split(',')
            .filter_map(|r| {
                if r.ends_with('-') {
                    return None;
                }

                let mut spec = r.split('=');

                Some(Lense::new(spec.next(), spec.next()))
            })
            .collect::<Vec<_>>()
    }
}

struct Box<'a> {
    id: usize,
    lenses: Vec<&'a Lense>,
}

impl<'a> Box<'a> {
    fn new(id: usize) -> Self {
        Box {
            id,
            lenses: Vec::new(),
        }
    }

    fn add(&mut self, lense: &'a Lense) {
        let label = &lense.label;

        match self.lenses.iter().position(|l| l.label == *label) {
            Some(position) => {
                self.lenses[position] = lense;
            }
            None => {
                self.lenses.push(lense);
            }
        }
    }

    fn remove(&mut self, label: &str) {
        let Some(position) = self.lenses.iter().position(|l| l.label == label) else {
            return;
        };

        self.lenses.remove(position);
    }
}

struct Boxes<'a>([Box<'a>; 256]);

impl<'a> Boxes<'a> {
    fn new() -> Self {
        Boxes(core::array::from_fn(Box::new))
    }

    fn process(&mut self, instruction: &str, lenses: &'a [Lense]) {
        if instruction.ends_with('-') {
            let label = &instruction[0..instruction.len() - 1];

            let index = State::hash_word(label);

            if let Some(current_box) = self.0.get_mut(index) {
                current_box.remove(label);
            }

            return;
        }

        let mut spec = instruction.split('=');

        let Some(label) = spec.next() else {
            panic!("No label, {instruction}");
        };

        let Some(length) = spec.next() else {
            panic!("No label, {instruction}");
        };

        let Ok(length) = length.parse::<usize>() else {
            panic!("Invalid length {length}");
        };

        let Some(lense) = lenses
            .iter()
            .find(|l| l.label == label && l.length == length)
        else {
            return;
        };

        let index = State::hash_word(label);

        if let Some(current_box) = self.0.get_mut(index) {
            current_box.add(lense)
        };
    }

    fn calc_power(&self) -> usize {
        self.0
            .iter()
            .map(|current_box| {
                current_box
                    .lenses
                    .iter()
                    .enumerate()
                    .map(|(index, lense)| (current_box.id + 1) * (index + 1) * (lense.length))
                    .sum::<usize>()
            })
            .sum::<usize>()
    }
}

#[aoc2023::main(15)]
fn main(input: &str) -> (usize, usize) {
    let mut part_one = 0;

    let mut boxes = Boxes::new();
    let lenses = Lense::new_vec(input);

    for instruction in input.split(',') {
        part_one += State::hash_word(instruction);
        boxes.process(instruction, &lenses);
    }

    (part_one, boxes.calc_power())
}
