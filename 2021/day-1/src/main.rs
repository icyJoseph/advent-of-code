use aoc;

fn solve(raw: String) -> () {
    println!("{}", raw);
}

fn main() {
    let input = aoc::get_input(2021, 1);

    let raw_input = std::fs::read_to_string("./input/day-1.in").expect("Error reading input");

    solve(input);
    solve(raw_input);
}
