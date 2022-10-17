import Foundation

let filename = "../input/day-5.in"

func normalize(_ vec: [Int]) -> [Int] {
    return [min(vec[0], vec[1]), max(vec[0], vec[1])]
}

func zipLine(_ left: [Int], _ right: [Int]) -> [[Int]] {
    let length = max(left.count, right.count)

    var result = [[Int]]()

    for index in 0 ..< length {
        result.append([left[index % left.count], right[index % right.count]])
    }

    return result
}

func walkLine(from: [Int], to: [Int]) -> [[Int]] {
    let xRange = normalize([from[0], to[0]])
    let yRange = normalize([from[1], to[1]])

    var x: [Int] = Array(xRange[0] ... xRange[1])
    var y: [Int] = Array(yRange[0] ... yRange[1])

    if from[0] < to[0] {
        x.reverse()
    }

    if from[1] < to[1] {
        y.reverse()
    }

    return zipLine(x, y)
}

func isDiagonal(_ line: [[Int]]) -> Bool {
    !(line[0][0] == line[1][0] || line[0][1] == line[1][1])
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        // x1, y1 -> x2, y2
        let lines = contents.split(separator: "\n").map {
            String($0).components(separatedBy: " -> ")
        }.map { spec in
            spec.map { input in
                input.split(separator: ",").map { Int($0)! }
            }
        }

        let solve = { withDiagonals in
            var freq = [String: Int]()

            for line in lines {
                if withDiagonals || !isDiagonal(line) {
                    let points = walkLine(from: line[0], to: line[1])

                    for point in points {
                        freq["\(point)", default: 0] += 1
                    }
                }
            }

            return freq.map { $1 }.filter { $0 > 1 }.count
        }

        print("Part one: ", solve(false))

        print("Part two: ", solve(true))
    } catch {
        print("Error solving problem. \(error)")
    }
}

main()
