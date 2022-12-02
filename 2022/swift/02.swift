import Foundation

let filename = "./input/02.in"

enum Throw: Int {
    case rock = 0; case paper = 1; case scissors = 2
}

enum Result: Int {
    case win = 1; case lose = -1; case draw = 0
}

let board: [[Result]] = [[.draw, .lose, .win], [.win, .draw, .lose], [.lose, .win, .draw]]

func normalHand(_ input: String) -> Throw? {
    if input == "A" || input == "X" {
        return .rock
    }
    if input == "B" || input == "Y" {
        return .paper
    }
    if input == "C" || input == "Z" {
        return .scissors
    }

    return nil
}

func handScore(_ hand: Throw) -> Int {
    switch hand {
    case .rock:
        return 1
    case .paper:
        return 2
    case .scissors:
        return 3
    }
}

func normalResult(_ input: String) -> Result? {
    if input == "X" {
        return .lose
    }

    if input == "Y" {
        return .draw
    }

    if input == "Z" {
        return .win
    }

    return nil
}

func main() {
    do {
        let games = try String(contentsOfFile: filename).split(separator: "\n").map { $0.split(separator: " ").map { String($0) }}

        print("Part one:", games.map {
            game in
            game.map { normalHand($0)! }
        }.reduce(0) {
            prev, curr in
            let hand = curr[1]
            let other = curr[0]
            let result = board[hand.rawValue][other.rawValue]

            let score = result == .win ? 6 : result == .draw ? 3 : 0

            return prev + score + handScore(hand)

        })

        print("Part two:", games.map {
            game in
            (normalHand(game[0])!, normalResult(game[1])!)
        }.reduce(0) {
            prev, curr in
            let (other, wanted) = curr

            let opponentResult = wanted.rawValue * -1

            let index = board[other.rawValue].firstIndex { $0.rawValue == opponentResult }!

            let hand = Throw(rawValue: index)!

            let score = wanted == .win ? 6 : wanted == .draw ? 3 : 0

            return prev + score + handScore(hand)

        })

    } catch {
        print(error)
    }
}

main()
