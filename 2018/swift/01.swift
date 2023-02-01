import Foundation

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    let deltas = contents.split(separator: "\n").compactMap { Int($0) }

    print("Part one:", deltas.reduce(0) { $0 + $1 })

    var seen = Set<Int>()
    var current = 0
    var pointer = 0

    while !seen.contains(current) {
        seen.insert(current)

        current += deltas[pointer]

        pointer = (pointer + 1) % deltas.count
    }

    print("Part two:", current)
}

let filename = "./input/01.in"

main(filename)
