use std::collections::HashMap;

pub fn lcm(nums: &[usize]) -> usize {
    if nums.len() == 1 {
        return nums[0];
    }
    let a = nums[0];
    let b = lcm(&nums[1..]);

    a * b / gcd(a, b)
}

fn gcd(a: usize, b: usize) -> usize {
    if b == 0 {
        return a;
    }
    gcd(b, a % b)
}

#[aoc2023::main(08)]
fn main(input: &str) -> (usize, usize) {
    let mut lines = input.lines();

    let Some(steps) = lines.next() else {
        panic!("No steps");
    };

    let cycle = steps.chars().cycle();

    lines.next();

    let mut graph: HashMap<&str, [&str; 2]> = HashMap::new();

    for node_desc in lines {
        let node = &node_desc[..3];
        let lhs = &node_desc[7..10];
        let rhs = &node_desc[12..node_desc.len() - 1];

        graph.insert(node, [lhs, rhs]);
    }

    let mut current = graph.get("AAA");

    let mut part_one = 0;

    for step in cycle {
        part_one += 1;

        match current {
            Some([lhs, rhs]) => {
                let next = match step {
                    'L' => lhs,
                    'R' => rhs,
                    _ => panic!("Rust stuff"),
                };

                if *next == "ZZZ" {
                    break;
                }

                current = graph.get(next);
            }
            _ => {}
        }
    }

    let mut nodes = graph
        .keys()
        .filter(|x| x.ends_with('A'))
        .collect::<Vec<_>>();

    let cycle = steps.chars().cycle();

    let mut periods = vec![];

    let mut count = 0;
    for step in cycle {
        count += 1;

        for i in 0..nodes.len() {
            match graph.get(nodes[i]) {
                Some([lhs, rhs]) => {
                    let next = match step {
                        'L' => lhs,
                        'R' => rhs,
                        _ => panic!("Rust stuff"),
                    };

                    if next.ends_with('Z') {
                        periods.push(count);
                    }

                    nodes[i] = next;
                }
                _ => {}
            }
        }

        if periods.len() == nodes.len() {
            break;
        }
    }

    (part_one, lcm(&periods))
}
