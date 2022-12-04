import Foundation

let filename = "./input/03.in"

func priority(_ ch: Character) -> Int {
    let lowerBound = ("a" as Character).asciiValue! - 1
    let upperBound = ("A" as Character).asciiValue! - 27

    let str = String(ch)

    return Int(str == str.lowercased() ? (ch.asciiValue! - lowerBound) : (ch.asciiValue! - upperBound))
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename).split(separator: "\n").map { Array(String($0)) }

        let partOne = contents.map {
            block in
            let left = Set(block[0 ..< block.count / 2])
            let right = Set(block[block.count / 2 ..< block.count])

            return Array(left.intersection(right)).map { priority($0) }.reduce(0, +)
        }.reduce(0, +)

        print("Part one:", partOne)

        var chunks = [[[Character]]]()

        for base in stride(from: 0, through: contents.count - 3, by: 3) {
            let chunk: [[Character]] = Array(contents[base ..< base + 3])

            chunks.append(chunk)
        }

        let partTwo = chunks.map {
            block in
            let unique = Set(block.flatMap { $0 })

            var counts: [Character: Int] = [:]

            for row in block {
                let local_unique = Set(row)
                for ch in local_unique {
                    counts[ch, default: 0] += 1
                }
            }

            return unique.filter { counts[$0] == 3 }.map(priority).reduce(0, +)
        }.reduce(0, +)

        print("Part two:", partTwo)
    } catch {
        print(error)
    }
}

main()
