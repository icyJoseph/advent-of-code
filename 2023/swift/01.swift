import Foundation

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    var part_one = 0

    for line in contents.split(separator: "\n") {
        var first: Int?
        var last: Int?

        for ch in line {
            if let value = ch.wholeNumberValue {
                if first == nil {
                    first = value
                }
                last = value
            }
        }

        part_one += (first ?? 0) * 10 + (last ?? 0)
    }

    print("Part 1: \(part_one)")

    let words = "one, two, three, four, five, six, seven, eight, nine".split(separator: ", ").enumerated().map {
        index, element in

        (element, index + 1)
    }

    var part_two = 0

    for line in contents.split(separator: "\n") {
        var first: Int?
        var last: Int?

        for index in 0 ..< line.count {
            let strIndex = line.index(line.startIndex, offsetBy: index)
            let ch = line[strIndex]
            let rest = line[strIndex...]

            guard let value = ch.wholeNumberValue ??
                words.first(where: {
                    str, _ in
                    rest.hasPrefix(str)

                })?.1
            else {
                continue
            }

            if first == nil {
                first = value
            }

            last = value
        }

        part_two += (first ?? 0) * 10 + (last ?? 0)
    }

    print("Part 2: \(part_two)")
}

let filename = "./input/01.in"

main(filename)
