use std::collections::HashSet;

struct State {
    index: usize,
    acc: i32,
}

#[derive(Copy, Clone)]
struct Action<'a> {
    name: &'a str,
    value: i32,
}

fn reducer(prev: State, action: Action) -> State {
    match action.name {
        "acc" => State {
            index: prev.index + 1,
            acc: prev.acc + action.value,
        },
        "jmp" => State {
            index: match action.value {
                val if val >= 0 => prev.index + (val as usize),
                val => prev.index - ((-1 * val) as usize),
            },
            ..prev
        },
        "nop" => State {
            index: prev.index + 1,
            ..prev
        },
        _ => panic!("Unknown instruction"),
    }
}

fn digest(list: &Vec<String>) -> Vec<Action> {
    list.into_iter()
        .map(|entry| {
            let instruction: Vec<&str> = entry.split(" ").collect();

            let name = match instruction.get(0) {
                Some(name) => name,
                _ => panic!("No action name"),
            };

            let value = match instruction.get(1) {
                Some(value) => match value.to_string().parse::<i32>() {
                    Ok(n) => n,
                    _ => panic!("Can't parse value"),
                },
                _ => panic!("No action value"),
            };

            Action { name, value }
        })
        .collect()
}

fn mutate(index: usize, instruction: &mut Vec<Action>) {
    match instruction.get(index) {
        Some(ins) => {
            if ins.name == "acc" {
                return;
            }
            instruction[index].name = if ins.name == "nop" { "jmp" } else { "nop" };
        }
        _ => panic!("Tried to mutate out of stack"),
    }
}

pub fn part_one(list: &Vec<String>) -> i32 {
    let mut state = State { index: 0, acc: 0 };
    let mut ran: HashSet<usize> = HashSet::new();
    let instructions = digest(list);

    loop {
        if ran.contains(&state.index) {
            break;
        }
        ran.insert(state.index);

        match instructions.get(state.index) {
            Some(&instruction) => state = reducer(state, instruction),
            _ => panic!("Out of instructions stack"),
        }
    }
    state.acc
}

pub fn part_two(list: &Vec<String>) -> i32 {
    let mut mod_index: usize = 0;

    loop {
        let mut state = State { index: 0, acc: 0 };
        let mut ran: HashSet<usize> = HashSet::new();
        let mut instructions = digest(list);
        mutate(mod_index, &mut instructions);

        'inner: loop {
            if ran.contains(&state.index) {
                break 'inner;
            }
            ran.insert(state.index);

            match instructions.get(state.index) {
                Some(&instruction) => state = reducer(state, instruction),
                _ => return state.acc,
            }
        }

        mod_index = mod_index + 1;
    }
}
