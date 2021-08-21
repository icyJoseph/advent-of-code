use aoc;

#[derive(Debug)]
struct Node {
    children: Vec<Node>,
    metadata: Vec<usize>,
}

impl Node {
    fn new<'a, I>(it: &mut I) -> Self
    where
        I: Iterator<Item = &'a usize>,
    {
        let children_len = match it.next() {
            Some(&n) => n,
            None => panic!("broken children instructions"),
        };

        let metadata_len = match it.next() {
            Some(&n) => n,
            None => panic!("broken meta instructions"),
        };

        let mut children = vec![];

        for _ in 0..children_len {
            children.push(Node::new(it));
        }

        let mut metadata = vec![];

        for _ in 0..metadata_len {
            match it.next() {
                Some(&n) => metadata.push(n),
                None => panic!("meta data length is broken"),
            }
        }

        Node { children, metadata }
    }

    fn total_metadata(&self) -> usize {
        let mut sum = self.metadata.iter().sum::<usize>();

        for child in self.children.iter() {
            sum += child.total_metadata();
        }

        sum
    }

    fn node_value(&self) -> usize {
        if self.children.len() == 0 {
            return self.metadata.iter().sum::<usize>();
        }

        let mut sum = 0;

        for &index in self.metadata.iter() {
            sum += match self.children.get(index - 1) {
                Some(c) => c.node_value(),
                None => 0,
            };
        }

        sum
    }
}

fn solve(raw: String) -> () {
    let input = raw
        .trim()
        .split(" ")
        .map(|x| x.parse::<usize>().unwrap())
        .collect::<Vec<usize>>();

    let mut it = input.iter();

    let root = Node::new(&mut it);

    println!("Part 1: {}", root.total_metadata());
    println!("Part 2: {}", root.node_value());
}

fn main() {
    let input = aoc::get_input(2018, 8);
    solve(input);
}
