import Foundation

let filename = "../input/day-5.in"

enum Type: String {
    case lower; case upper
}

func partition(type: Type, range: (Int, Int)) -> (lower: Int, upper: Int) {
    let (lower, upper) = range
    switch type {
    case .upper:
        return (lower: 1 + (upper + lower) / 2, upper: upper)
    case .lower:
        return (lower: lower, upper: (upper + lower) / 2)
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let seats = contents.split(separator: "\n").map { Array(String($0)) }

        var highest: Int!

        var ids = [Int]()

        for seat in seats {
            var row = (0, 127)
            var col = (0, 7)

            for char in seat[...6] {
                let type = char == "F" ? Type.lower : Type.upper
                row = partition(type: type, range: row)
            }

            for char in seat[7...] {
                let type = char == "L" ? Type.lower : Type.upper
                col = partition(type: type, range: col)
            }

            let id = row.0 * 8 + col.0

            ids.append(id)

            if highest == nil || highest < id {
                highest = id
            }
        }

        if let highest {
            print("Part one:", highest)
        }

        let sortedIds = ids.sorted().enumerated().map { $0 }

        if let (_, first) = sortedIds[..<sortedIds.count].first(where: {
            item in
            let (index, value) = item
            return sortedIds[index + 1].1 == value + 2
        }) {
            let targetId = first + 1
            print("Part two:", targetId)
        }

    } catch {
        print(error)
    }
}

main()
