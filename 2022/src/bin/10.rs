struct Cpu {
    register: isize,
}

impl Cpu {
    fn new() -> Self {
        Cpu { register: 1 }
    }

    fn tick(&mut self, by: &isize) {
        self.register += *by;
    }
}

struct Sprite {
    cpu: Cpu,
}

impl Sprite {
    fn new() -> Self {
        Sprite { cpu: Cpu::new() }
    }

    fn is_active(&self, pos: isize) -> bool {
        self.cpu.register - 1 <= pos && pos <= self.cpu.register + 1
    }
}

struct Screen {
    width: usize,
    pixels: Vec<char>,
}

impl Screen {
    fn new(width: usize, height: usize) -> Self {
        Screen {
            width,
            pixels: vec![' '; width * height],
        }
    }

    fn draw(&mut self, pos: usize, color: char) {
        self.pixels[pos] = color;
    }

    fn print(&self) -> String {
        let rows = self.pixels.chunks(self.width);
        let mut result = String::from("\n");

        for row in rows {
            result = format!("{}\n{}", result, row.iter().collect::<String>());
        }

        result
    }
}

#[aoc2022::main(10)]
fn main(input: &str) -> (isize, String) {
    let instructions = input
        .lines()
        .flat_map(|line| {
            let mut it = line.split_whitespace();

            if let Some(qty) = it.nth(1) {
                return vec![Some(0), qty.parse::<isize>().ok()];
            }

            vec![Some(0)]
        })
        .into_iter()
        .flatten()
        .collect::<Vec<_>>();

    let mut cpu = Cpu::new();

    let mut strength = 0;

    for (index, inst) in instructions.iter().enumerate() {
        let cycle = index + 1;

        if cycle % 40 == 20 {
            strength += (cycle as isize) * cpu.register;
        }

        cpu.tick(inst);
    }

    let mut sprite = Sprite::new();
    let mut screen = Screen::new(40, 6);

    for (index, inst) in instructions.iter().enumerate() {
        let color = if sprite.is_active((index as isize) % 40) {
            '#'
        } else {
            ' '
        };

        screen.draw(index, color);

        sprite.cpu.tick(inst);
    }

    (strength, screen.print())
}
