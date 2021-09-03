use aoc;

use self::OpCode::*;
use std::slice::Iter;

#[derive(Debug, Copy, Clone)]
enum OpCode {
    Addr,
    Addi,
    Mulr,
    Muli,
    Banr,
    Bani,
    Borr,
    Bori,
    Setr,
    Seti,
    Gtir,
    Gtri,
    Gtrr,
    Eqir,
    Eqri,
    Eqrr,
}

impl OpCode {
    fn iterator() -> Iter<'static, OpCode> {
        static OPCODES: [OpCode; 16] = [
            Addr, Addi, Mulr, Muli, Banr, Bani, Borr, Bori, Setr, Seti, Gtir, Gtri, Gtrr, Eqir,
            Eqri, Eqrr,
        ];
        OPCODES.iter()
    }

    fn execute(
        self,
        input_a: usize,
        input_b: usize,
        output: usize,
        register: &[usize],
    ) -> Vec<usize> {
        let mut after = vec![register[0], register[1], register[2], register[3]];
        after[output] = match self {
            Addr => register[input_a] + register[input_b],
            Addi => register[input_a] + input_b,
            Mulr => register[input_a] * register[input_b],
            Muli => register[input_a] * input_b,
            Banr => register[input_a] & register[input_b],
            Bani => register[input_a] & input_b,
            Borr => register[input_a] | register[input_b],
            Bori => register[input_a] | input_b,
            Setr => register[input_a],
            Seti => input_a,
            Gtir => {
                if input_a > register[input_b] {
                    1
                } else {
                    0
                }
            }
            Gtri => {
                if register[input_a] > input_b {
                    1
                } else {
                    0
                }
            }
            Gtrr => {
                if register[input_a] > register[input_b] {
                    1
                } else {
                    0
                }
            }
            Eqir => {
                if input_a == register[input_b] {
                    1
                } else {
                    0
                }
            }
            Eqri => {
                if register[input_a] == input_b {
                    1
                } else {
                    0
                }
            }
            Eqrr => {
                if register[input_a] == register[input_b] {
                    1
                } else {
                    0
                }
            }
        };

        after
    }
}

fn test(before: &[usize], instruction: &[usize], after: &[usize]) -> usize {
    let mut total_matches = 0;

    let input_a = instruction[1];
    let input_b = instruction[2];
    let output = instruction[3];

    for code in OpCode::iterator() {
        if after == code.execute(input_a, input_b, output, before) {
            total_matches += 1;
        }
    }

    total_matches
}

fn solve(raw: String) -> () {
    let groups = raw.trim().split("\n\n\n").collect::<Vec<&str>>();

    let samples_group = groups[0];

    let samples = samples_group.split("\n\n").collect::<Vec<&str>>();

    let mut over_three_matches = 0;

    for sample in samples {
        let spec = sample.split("\n").collect::<Vec<&str>>();

        let before = spec[0]
            .replace("Before: ", "")
            .replace("[", "")
            .replace("]", "")
            .replace(",", "")
            .split(" ")
            .map(|n| n.parse::<usize>())
            .filter(|n| if let Ok(_) = n { true } else { false })
            .map(|n| match n {
                Ok(i) => i,
                Err(why) => panic!("{:?}", why),
            })
            .collect::<Vec<_>>();

        let after = spec[2]
            .replace("After: ", "")
            .replace("[", "")
            .replace("]", "")
            .replace(",", "")
            .split(" ")
            .map(|n| n.parse::<usize>())
            .filter(|n| if let Ok(_) = n { true } else { false })
            .map(|n| match n {
                Ok(i) => i,
                Err(why) => panic!("{:?}", why),
            })
            .collect::<Vec<_>>();

        let instruction = spec[1]
            .split(" ")
            .map(|n| n.parse::<usize>())
            .filter(|n| if let Ok(_) = n { true } else { false })
            .map(|n| match n {
                Ok(i) => i,
                Err(why) => panic!("{:?}", why),
            })
            .collect::<Vec<_>>();

        if test(&before, &instruction, &after) >= 3 {
            over_three_matches += 1;
        }
    }

    println!("Part 1: {}", over_three_matches);
}

fn main() {
    let input = aoc::get_input(2018, 16);
    solve(input);
}
