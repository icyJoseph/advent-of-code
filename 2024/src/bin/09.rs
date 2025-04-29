#[derive(Debug, Copy, Clone)]
struct File {
    id: usize,
}

#[aoc2024::main(09)]
fn main(input: &str) -> (usize, usize) {
    let mut memory: Vec<Option<File>> = vec![];

    let mut files: Vec<usize> = vec![];
    let mut free: Vec<usize> = vec![];

    for (index, ch) in input.chars().enumerate() {
        let Some(size) = ch.to_digit(10) else {
            panic!("cannot parse {}", ch);
        };

        let quantity = size as usize;

        for _ in 0..quantity {
            if index % 2 == 0 {
                files.push(memory.len());
                memory.push(Some(File { id: index / 2 }));
            } else {
                free.push(memory.len());
                memory.push(None);
            }
        }
    }

    for index in free {
        let Some(next) = files.pop() else { break };

        if next < index {
            break;
        }

        memory[index] = memory[next];
        memory[next] = None;
    }

    let mut p1 = 0;

    for (pos, entry) in memory.iter().enumerate() {
        match entry {
            Some(File { id }) => p1 += pos * id,
            None => break,
        }
    }

    let mut file_blocks: Vec<(usize, usize, usize)> = vec![];
    let mut free_blocks: Vec<(usize, usize)> = vec![];

    let mut position = 0;

    for (index, ch) in input.chars().enumerate() {
        let Some(size) = ch.to_digit(10) else {
            panic!("cannot parse {}", ch);
        };

        let quantity = size as usize;

        if index % 2 == 0 {
            // memory block
            file_blocks.push((position, quantity, index / 2))
        } else {
            free_blocks.push((position, quantity));
        }

        position += quantity;
    }

    for index in (0..file_blocks.len()).rev() {
        let Some(target) = free_blocks
            .iter()
            .position(|pos| pos.1 >= file_blocks[index].1)
        else {
            continue;
        };

        if index < target {
            continue;
        }

        free_blocks[target].1 -= file_blocks[index].1;
        file_blocks[index].0 = free_blocks[target].0;
        free_blocks[target].0 += file_blocks[index].1;
    }

    let mut p2 = 0;

    for (position, qty, id) in file_blocks {
        for offset in 0..qty {
            p2 += (position + offset) * id;
        }
    }

    (p1, p2)
}
