#[derive(Debug, Copy, Clone)]
enum Throw {
    Rock = 0,
    Paper = 1,
    Scissors = 2,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq)]
enum Result {
    Win = 1,
    Lose = -1,
    Draw = 0,
}
// Ordered as Rock Paper Scissors
const RESULTS: [[Result; 3]; 3] = [
    [Result::Draw, Result::Lose, Result::Win],
    [Result::Win, Result::Draw, Result::Lose],
    [Result::Lose, Result::Win, Result::Draw],
];

impl Result {
    fn score(self: &Result) -> usize {
        match self {
            Result::Win => 6,
            Result::Draw => 3,
            Result::Lose => 0,
        }
    }
    fn from(str: &str) -> Result {
        match str {
            "X" => Result::Lose,
            "Y" => Result::Draw,
            "Z" => Result::Win,
            _ => panic!("Invalid input"),
        }
    }

    fn reverse(self: &Result) -> Result {
        match self {
            Result::Win => Result::Lose,
            Result::Lose => Result::Win,
            Result::Draw => Result::Draw,
        }
    }
}

impl Throw {
    fn score(self: &Throw) -> usize {
        match self {
            Throw::Rock => 1,
            Throw::Paper => 2,
            Throw::Scissors => 3,
        }
    }

    fn from(str: &str) -> Throw {
        match str {
            "A" | "X" => Throw::Rock,
            "B" | "Y" => Throw::Paper,
            "C" | "Z" => Throw::Scissors,
            _ => panic!("Invalid input"),
        }
    }

    fn result(self: &Throw, other: &Throw) -> &Result {
        return &RESULTS[*self as usize][*other as usize];
    }

    fn from_result(self: &Throw, wanted: &Result) -> Throw {
        match &RESULTS[*self as usize].iter().position(|res| res == wanted) {
            Some(0) => Throw::Rock,
            Some(1) => Throw::Paper,
            Some(2) => Throw::Scissors,
            _ => panic!("Invalid position"),
        }
    }
}

#[aoc2022::main(02)]
fn main(input: &str) -> (usize, usize) {
    let games = input
        .split("\n")
        .map(|game| game.split(" ").map(String::from).collect())
        .collect::<Vec<Vec<String>>>();

    let part_one = games.iter().fold(0usize, |prev, curr| {
        let hand = Throw::from(&curr[1]);
        let other = Throw::from(&curr[0]);

        let result = hand.result(&other);
        return prev + hand.score() + result.score();
    });

    let part_two = games.iter().fold(0usize, |prev, curr| {
        let other = Throw::from(&curr[0]);

        let wanted = Result::from(&curr[1]);

        let hand = other.from_result(&wanted.reverse());

        return prev + hand.score() + wanted.score();
    });

    (part_one, part_two)
}
