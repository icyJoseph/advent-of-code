import Foundation

let filename = "../input/day-10.in"
// let filename = "../input/example.in"

struct Group {
    var open: Character
    var close: Character?
    var openLoc: Int
    var closeLoc: Int?
}

enum ParserError: Error {
    case invalidCharacter(char: Character)
}

func parseGroups(source input: IndexingIterator<[Character]>, _ loc: Int, _ group: [Group]) throws -> [Group] {
    var source = input

    var nextGroup = group

    if let next = source.next() {
        switch next {
        // group openers
        case "(", "[", "{", "<":
            let newGroup = Group(open: next, close: nil, openLoc: loc, closeLoc: nil)

            nextGroup.append(newGroup)

            return try parseGroups(source: source, loc + 1, nextGroup)

        // group terminators
        case ")", "]", "}", ">":
            if let index = group.lastIndex(where: {
                item in
                item.close == nil
            }) {
                let current = nextGroup[index]

                nextGroup[index] = Group(open: current.open, close: next, openLoc: current.openLoc, closeLoc: loc)
            }
            return try parseGroups(source: source, loc + 1, nextGroup)

        default:
            throw ParserError.invalidCharacter(char: next)
        }

    } else {
        return group
    }
}

func isValid(_ group: Group) -> Bool {
    switch group.open {
    case "(":
        if let close = group.close {
            return close == ")"
        }

    case "<":
        if let close = group.close {
            return close == ">"
        }

    case "{":
        if let close = group.close {
            return close == "}"
        }

    case "[":
        if let close = group.close {
            return close == "]"
        }
    default:
        break
    }

    return true
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows: [[Character]] = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: "\n").map { Array($0) }

        var partOne = 0

        var scores = [Int]()

        for row in rows {
            let iterator = row.makeIterator()
            let groups = try parseGroups(source: iterator, 0, [])

            if let firstInvalid = groups.first(where: { !isValid($0) }) {
                switch firstInvalid.close {
                case ")":
                    partOne += 3
                case "]":
                    partOne += 57
                case "}":
                    partOne += 1197
                case ">":
                    partOne += 25137

                default:
                    break
                }

                // if there was an invalid group, then skip this row
            } else {
                let score = groups.sorted { $0.openLoc > $1.openLoc }.reduce(0) {
                    acc, group in

                    if group.close == nil {
                        let next = acc * 5

                        switch group.open {
                        case "(":
                            return next + 1
                        case "[":
                            return next + 2
                        case "{":
                            return next + 3
                        case "<":
                            return next + 4
                        default:
                            return acc
                        }
                    }
                    return acc
                }

                scores.append(score)
            }
        }

        print("Part one:", partOne)

        scores.sort()

        let partTwo = scores[scores.count / 2]

        print("Part two:", partTwo)
    } catch {
        print(error)
    }
}

main()
