#[derive(Debug)]
pub enum OP {
    Add,
    Mult,
    Halt,
    Value(usize),
    Error,
}

fn resolve_usize(step: usize) -> OP {
    match step {
        1 => OP::Add,
        2 => OP::Mult,
        99 => OP::Halt,
        val => OP::Value(val),
    }
}

pub fn segment(commands: &String) -> Vec<&str> {
    commands.split_terminator(',').collect()
}

pub fn parse(segments: &Vec<&str>) -> Vec<usize> {
    return segments
        .iter()
        .map(|x| x.parse::<usize>().expect("Failed to parse"))
        .collect();
}

pub fn replace(mut commands: Vec<usize>, first: usize, second: usize) -> Vec<usize> {
    commands.insert(1, first);
    commands.remove(2);
    commands.insert(2, second);
    commands.remove(3);
    return commands;
}

pub fn write(operations: Vec<usize>) -> Vec<usize> {
    let mut result: Vec<usize> = operations[..].to_vec();

    let mut next = 0;
    for index in 0..operations.len() {
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

fn usize_to_string(vector: Vec<usize>) -> Vec<String> {
    vector.iter().map(|x| x.to_string()).collect()
}

pub fn join(results: Vec<usize>, pattern: Option<&str>) -> String {
    let as_string: Vec<String> = usize_to_string(results);
    if let Some(pattern) = pattern {
        return as_string.join(pattern);
    } else {
        return as_string.join(",");
    }
}
