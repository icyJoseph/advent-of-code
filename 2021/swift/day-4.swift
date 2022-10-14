import Foundation

let filename = "../input/day-4.in"

func parse(_ str: String) -> Int {
    Int(str)!
}

func checkBoard(board: [[Int]], sequence: Set<Int>) -> Bool {
    let width = board[0].count

    for index in 0 ..< width {
        let rowWin = { board[index].map { sequence.contains($0) }.filter(!).count == 0 }

        let colWin = { board.map { $0[index] }.map { sequence.contains($0) }.filter(!).count == 0 }

        if rowWin() || colWin() {
            return true
        }
    }

    return false
}

func scoreBoard(board: [[Int]], sequence: Set<Int>, last: Int) -> Int {
    return last * board.reduce(0) { acc, row in
        acc + row.filter { !sequence.contains($0) }.reduce(0,+)
    }
}

func findFirstWinnerBoardScore(boards: [[[Int]]], numbers: [Int]) -> Int? {
    var progress: Set<Int> = Set()

    for num in numbers {
        progress.insert(num)

        for board in boards {
            if checkBoard(board: board, sequence: progress) {
                return scoreBoard(board: board, sequence: progress, last: num)
            }
        }
    }

    return nil
}

func findLastWinnerBoardScore(boards: [[[Int]]], numbers: [Int]) -> Int? {
    var progress: Set<Int> = Set()
    var winners: Set<Int> = Set()

    var lastWinningBoard: [[Int]]?
    var lastWinningNumber: Int?

    for num in numbers {
        progress.insert(num)

        for (index, board) in boards.enumerated() {
            if winners.contains(index) { continue }

            if checkBoard(board: board, sequence: progress) {
                winners.insert(index)
                lastWinningBoard = board
                lastWinningNumber = num
            }
        }

        if winners.count == boards.count {
            break
        }
    }

    if let lastWinningBoard, let lastWinningNumber {
        return scoreBoard(board: lastWinningBoard, sequence: progress, last: lastWinningNumber)
    }
    return nil
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let game = contents.components(separatedBy: "\n\n")

        let sequence = game[0].split(separator: ",").map { parse(String($0)) }

        let boards = game[1...].map { $0.split(separator: "\n") }.map {
            $0.map {
                $0.split(separator: " ").map { parse(String($0)) }
            }
        }

        let partOne = findFirstWinnerBoardScore(boards: boards, numbers: sequence)!

        print("Part one: \(partOne)")

        let partTwo = findLastWinnerBoardScore(boards: boards, numbers: sequence)!

        print("Part two: \(partTwo)")
    } catch {
        print("Failed to read file")
    }
}

main()
