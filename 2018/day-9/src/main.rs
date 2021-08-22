use aoc;

fn solve(raw: &String, mult: usize) -> usize {
    let input = raw
        .trim()
        .replace(" players; last marble is worth", "")
        .replace(" points", "");

    let spec = input
        .split(" ")
        .map(|x| x.parse::<usize>().unwrap())
        .collect::<Vec<usize>>();

    let last_marble = spec[1] * mult;

    let mut next_marble = 0;

    let mut circle = vec![];
    let mut current_index = 0;

    let mut player = 1;
    let mut scores = vec![0; spec[0]];

    circle.push(Some(next_marble));

    loop {
        next_marble += 1;

        if next_marble > last_marble {
            break;
        }

        if next_marble % 23 == 0 {
            scores[player - 1] = scores[player - 1] + next_marble;

            let remove_index = (circle.len() + current_index - 7) % circle.len();

            match circle.remove(remove_index) {
                Some(r) => {
                    scores[player - 1] = scores[player - 1] + r;
                }
                None => panic!("There was nothing to remove"),
            }

            current_index = remove_index;
        } else {
            let insert_at = if circle.len() == 1 {
                1
            } else {
                (current_index + 2) % circle.len()
            };
            circle.insert(insert_at, Some(next_marble));
            current_index = insert_at;
        }

        player += 1;

        if player > spec[0] {
            player = 1;
        }
    }

    match scores.iter().max() {
        Some(&m) => m,
        None => panic!("Game ran incorrectly"),
    }
}

fn main() {
    let input = aoc::get_input(2018, 9);
    println!("Part 1: {}", solve(&input, 1));
    //println!("Part 2: {}", solve(&input, 100));
}
