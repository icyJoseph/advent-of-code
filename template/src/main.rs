use aoc;

fn solve(raw: String) -> () {
    println!("{}", raw);
}

fn main() {
    let input = aoc::get_input({{year}}, {{day}});
    
    // let input = std::fs::read_to_string("").expect("Error reading input");

    solve(input);
}

// Utilities
#[allow(dead_code)]
fn normal(x: usize, y: usize, width: usize) -> usize {
    x + y * width
}

#[allow(dead_code)]
fn rev_normal(norm: usize, width: usize) -> (usize, usize) {
    (norm % width, norm / width)
}

#[allow(dead_code)]
fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}
#[allow(dead_code)]
fn to_int(bin: &str) -> u32 {
    match u32::from_str_radix(bin, 2) {
        Ok(n) => n,
        _ => panic!("Error parsing binary to integer"),
    }
}

#[allow(dead_code)]
fn string_vec<T: std::string::ToString>(vec: &Vec<T>, separator: &str) -> String {
    vec.iter()
        .map(|x| x.to_string())
        .collect::<Vec<String>>()
        .join(separator)
}
