#[derive(Debug)]
pub enum OP {
    Add,
    Mult,
    Halt,
    Value(usize),
    Error,
}

fn resolve(step: Result<usize, std::num::ParseIntError>) -> OP {
    match step {
        Ok(1) => OP::Add,
        Ok(2) => OP::Mult,
        Ok(99) => OP::Halt,
        Ok(val) => OP::Value(val),
        Err(_) => OP::Error,
    }
}

fn resolve_usize(step: usize) -> OP {
    match step {
        1 => OP::Add,
        2 => OP::Mult,
        99 => OP::Halt,
        val => OP::Value(val),
    }
}

pub fn parse(commands: String) -> Vec<OP> {
    return commands
        .split_terminator(',')
        .map(|x| resolve(x.parse::<usize>()))
        .collect();
}

pub fn replace(mut commands: Vec<OP>) -> Vec<OP> {
    commands[1] = OP::Value(12);
    commands[2] = OP::Mult;
    return commands;
}

pub fn extract_value(option: Option<&OP>) -> usize {
    match option {
        Some(OP::Value(x)) => *x,
        Some(OP::Add) => 1,
        Some(OP::Mult) => 2,
        Some(OP::Halt) => 99,
        _ => panic!("Tried to extract unknown value!"),
    }
}

pub fn write(operations: &Vec<OP>) -> Vec<usize> {
    let mut result: Vec<usize> = operations[..]
        .iter()
        .map(|x| extract_value(Some(&x)))
        .collect();

    let mut next = 0;
    for (index, _) in operations.iter().enumerate() {
        if next < operations.len() && next == index {
            let op = resolve_usize(result[index]);
            match op {
                OP::Add => {
                    let pos_left: usize = result[index + 1];
                    let pos_right: usize = result[index + 2];
                    let pos_result: usize = result[index + 3];
                    result[pos_result] = result[pos_left] + result[pos_right];
                    next = index + 4;
                    continue;
                }
                OP::Mult => {
                    let pos_left: usize = result[index + 1];
                    let pos_right: usize = result[index + 2];
                    let pos_result: usize = result[index + 3];
                    result[pos_result] = result[pos_left] * result[pos_right];
                    next = index + 4;
                    continue;
                }
                OP::Halt => break,
                _ => continue,
            }
        }
    }

    return result;
}

pub fn join(results: Vec<usize>) -> String {
    let as_string: Vec<String> = results.iter().map(|x| x.to_string()).collect();
    return as_string.join(",");
}
