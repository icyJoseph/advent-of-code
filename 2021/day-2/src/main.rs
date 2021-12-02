use aoc;

fn parse_num<T: std::str::FromStr>(str: &str) -> T {
    match str.trim().parse::<T>() {
        Ok(n) => n,
        _ => panic!("Error parsing"),
    }
}

fn solve(raw: String) -> () {
    let rows = raw.trim().split("\n").collect::<Vec<&str>>();

    let part_one: (u32, u32) = rows.iter().fold((0, 0), |prev, row| {
        let command = row.split(" ").collect::<Vec<&str>>();
        let dir: &str = command[0];
        let step = parse_num::<u32>(command[1]);

        match dir {
            "forward" => return (prev.0 + step, prev.1),
            "down" => return (prev.0, prev.1 + step),
            "up" => return (prev.0, prev.1 - step),
            _ => panic!("Missing command"),
        }
    });

    println!("Part One: {}", part_one.0 * part_one.1); // 1746616

    let part_two = rows.iter().fold((0, 0, 0), |prev, row| {
        let command = row.split(" ").collect::<Vec<&str>>();
        let dir: &str = command[0];
        let step = parse_num::<u32>(command[1]);

        match dir {
            "forward" => return (prev.0 + step, prev.1 + prev.2 * step, prev.2),
            "down" => return (prev.0, prev.1, prev.2 + step),
            "up" => return (prev.0, prev.1, prev.2 - step),
            _ => panic!("Missing command"),
        }
    });

    println!("Part Two: {}", part_two.0 * part_two.1); // 1741971043
}

fn main() {
    let input = aoc::get_input(2021, 2);

    solve(input);
}
