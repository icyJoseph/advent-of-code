use aoc;

fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}

fn solve(raw: String) -> () {
    println!("{}", raw);
}

fn main() {
    let input = aoc::get_input({{year}}, {{day}});
    
    // let example_input = std::fs::read_to_string("").expect("Error reading input");

    solve(input);
}
