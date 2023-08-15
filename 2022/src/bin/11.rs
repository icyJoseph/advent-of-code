use std::collections::HashMap;

#[derive(Debug)]
struct Monkey {
    items: Vec<usize>,
    operation: String,
    to_test: usize,
    when_true: usize,
    when_false: usize,
    handled: usize,
}

impl Monkey {
    fn new(
        start: Vec<usize>,
        operation: String,
        to_test: usize,
        when_true: usize,
        when_false: usize,
    ) -> Self {
        Monkey {
            items: start,
            operation,
            to_test,
            when_true,
            when_false,
            handled: 0,
        }
    }

    fn receive(&mut self, item: usize) {
        self.items.push(item)
    }

    fn process(index: usize, mut monkeys: Vec<Monkey>) -> Vec<Monkey> {
        while let Some(item) = monkeys[index].items.pop() {
            monkeys[index].handled += 1;

            let result = {
                let op = monkeys[index]
                    .operation
                    .split_whitespace()
                    .collect::<Vec<&str>>();

                match (op[0], op[1], op[2].parse::<usize>().ok()) {
                    ("old", "*", Some(n)) => item * n,
                    ("old", "+", Some(n)) => item + n,
                    ("old", "*", None) => item * item,
                    ("old", "+", None) => item + item,
                    _ => {
                        panic!("Unexpected operation")
                    }
                }
            } / 3;

            let target = if result % monkeys[index].to_test == 0 {
                monkeys[index].when_true
            } else {
                monkeys[index].when_false
            };

            monkeys[target].receive(result);
        }

        monkeys
    }
}

struct PrimeMonkey {
    items: Vec<HashMap<usize, usize>>,
    operation: String,
    to_test: usize,
    when_true: usize,
    when_false: usize,
    handled: usize,
}

impl PrimeMonkey {
    fn new(
        starting: Vec<usize>,
        operation: String,
        to_test: usize,
        when_true: usize,
        when_false: usize,
        primes: &[usize],
    ) -> Self {
        let items = starting
            .iter()
            .map(|s| {
                primes
                    .iter()
                    .map(|&prime| (prime, s % prime))
                    .collect::<HashMap<usize, usize>>()
            })
            .collect::<Vec<_>>();

        PrimeMonkey {
            items,
            operation,
            to_test,
            when_true,
            when_false,
            handled: 0,
        }
    }

    fn receive(&mut self, item: HashMap<usize, usize>) {
        self.items.push(item)
    }

    fn process(index: usize, mut monkeys: Vec<PrimeMonkey>) -> Vec<PrimeMonkey> {
        while let Some(item) = monkeys[index].items.pop() {
            monkeys[index].handled += 1;

            let result = {
                let op = monkeys[index]
                    .operation
                    .split_whitespace()
                    .collect::<Vec<&str>>();

                let mut result = HashMap::new();

                for (prime, value) in item {
                    let next_value = match (op[0], op[1], op[2].parse::<usize>().ok()) {
                        ("old", "*", Some(n)) => value * n,
                        ("old", "+", Some(n)) => value + n,
                        ("old", "*", None) => value * value,
                        ("old", "+", None) => value + value,
                        _ => {
                            panic!("Unexpected operation")
                        }
                    };

                    result.insert(prime, next_value % prime);
                }

                result
            };

            let target = if result[&monkeys[index].to_test] == 0 {
                monkeys[index].when_true
            } else {
                monkeys[index].when_false
            };

            monkeys[target].receive(result);
        }

        monkeys
    }
}

fn parse_lines(desc: Vec<&str>) -> (Vec<usize>, String, usize, usize, usize) {
    let starting = desc[1].split(':').collect::<Vec<&str>>()[1]
        .split(',')
        .filter_map(|x| x.trim().parse::<usize>().ok())
        .collect::<Vec<usize>>();

    let operation = desc[2].trim().split(" = ").collect::<Vec<&str>>()[1].to_string();

    let to_test = desc[3]
        .split_whitespace()
        .filter_map(|x| x.parse::<usize>().ok())
        .collect::<Vec<usize>>()[0];

    let when_true = desc[4]
        .split_whitespace()
        .filter_map(|x| x.parse::<usize>().ok())
        .collect::<Vec<usize>>()[0];

    let when_false = desc[5]
        .split_whitespace()
        .filter_map(|x| x.parse::<usize>().ok())
        .collect::<Vec<usize>>()[0];

    (starting, operation, to_test, when_true, when_false)
}

#[aoc2022::main(11)]
fn main(input: &str) -> (usize, usize) {
    let mut monkeys: Vec<Monkey> = input
        .split("\n\n")
        .map(|block| {
            let desc = block.lines().collect::<Vec<&str>>();

            let (starting, operation, to_test, when_true, when_false) = parse_lines(desc);

            Monkey::new(starting, operation, to_test, when_true, when_false)
        })
        .collect::<_>();

    for _ in 0..20 {
        for index in 0..monkeys.len() {
            monkeys = Monkey::process(index, monkeys);
        }
    }

    let monkey_level = {
        let mut handled = monkeys.iter().map(|m| m.handled).collect::<Vec<_>>();

        handled.sort_by(|a, b| b.cmp(a));

        handled[0] * handled[1]
    };

    let primes = monkeys.iter().map(|m| m.to_test).collect::<Vec<usize>>();

    let mut prime_monkeys: Vec<PrimeMonkey> = input
        .split("\n\n")
        .map(|block| {
            let desc = block.lines().collect::<Vec<&str>>();

            let (starting, operation, to_test, when_true, when_false) = parse_lines(desc);

            PrimeMonkey::new(starting, operation, to_test, when_true, when_false, &primes)
        })
        .collect::<_>();

    for _ in 0..10_000 {
        for index in 0..prime_monkeys.len() {
            prime_monkeys = PrimeMonkey::process(index, prime_monkeys);
        }
    }

    let prime_monkey_level = {
        let mut handled = prime_monkeys.iter().map(|m| m.handled).collect::<Vec<_>>();

        handled.sort_by(|a, b| b.cmp(a));

        handled[0] * handled[1]
    };

    (monkey_level, prime_monkey_level)
}
