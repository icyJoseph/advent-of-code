import Foundation

let filename = "../input/day-8.in"

typealias SignalRep = String.SubSequence

func normalize(_ src: SignalRep) -> SignalRep {
    let chars = src.sorted()

    return String.SubSequence(chars)
}

// given a left string, returns characters not present in right
func leftExclusion(_ left: SignalRep, _ right: SignalRep) -> SignalRep {
    var result = String.SubSequence()

    for c in left {
        if !right.contains(c) {
            result.append(c)
        }
    }

    return result
}

func union(_ left: SignalRep, _ right: SignalRep) -> SignalRep {
    var chars = Set<Character>()

    for c in left {
        chars.insert(c)
    }

    for c in right {
        chars.insert(c)
    }

    return String.SubSequence(chars)
}

func dedupe(_ list: [SignalRep]) -> [SignalRep] {
    let unique = Set(list)
    return Array(unique)
}

func decodeSignal(input left: [SignalRep], output right: [SignalRep]) -> Int {
    var sources = [String.SubSequence]()
    sources.append(contentsOf: left)
    sources.append(contentsOf: right)
    sources = sources.map { normalize($0) }
    sources = dedupe(sources)

    /**

          ---

          1 has 2 segments
          4 has 4 segments
          7 has 3 segments
          8 has 7 segments

          ---

          2 has 5 segments
          3 has 5 segments
          5 has 5 segments

          0 has 6 segments
          6 has 6 segments
          9 has 6 segments

          ---

     Operations:

     1. Look for 1, 4, 7, 8
     2. Identify 9 by, joining 7 with 4 and find a 6 segment that contains all bars
     3. Identify 0 by 9 - (6 segments) such that intersecting with 1 has 0 members
     4. 6 is only 6 segment left
     5. Identify 3 by (5 segments) - 1, such that it keeps 3 segments
     6. From 5 segments, remove common with 4, 5 has 2 segments and is not 3, 2 has 3 segments
          */

    let one = sources.filter { $0.count == 2 }[0]
    let four = sources.filter { $0.count == 4 }[0]
    let seven = sources.filter { $0.count == 3 }[0]
    let eight = sources.filter { $0.count == 7 }[0]

    var sixSegments = sources.filter { $0.count == 6 }

    let fourSeven = union(four, seven)

    let nine = sixSegments.filter { leftExclusion($0, fourSeven).count == 1 }[0]

    sixSegments = sixSegments.filter { $0 != nine }

    let zero = sixSegments.filter { leftExclusion(one, $0).count == 0 }[0]

    let six = sixSegments.filter { $0 != zero }[0]

    let fiveSegments = sources.filter { $0.count == 5 }

    let three = fiveSegments.filter { leftExclusion($0, one).count == 3 }[0]

    let five = fiveSegments.filter { leftExclusion($0, four).count == 2 && $0 != three }[0]

    let two = fiveSegments.filter { leftExclusion($0, four).count == 3 }[0]

    let digits = [zero, one, two, three, four, five, six, seven, eight, nine]

    let output = right.map { normalize($0) }.reduce(0) {
        acc, curr in
        if let sig = digits.firstIndex(of: curr) {
            return 10 * acc + sig
        } else {
            print("Error!", curr)
            return acc
        }
    }

    return output
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)
        let signals = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: "\n").map { $0.components(separatedBy: " | ") }.map { [$0[0].split(separator: " "), $0[1].split(separator: " ")] }

        let partOne = signals.reduce(0) {
            total, signal in
            total + signal[1].reduce(0) {
                acc, word in
                switch word.count {
                case 2, 3, 4, 7:
                    return acc + 1
                default:
                    return acc
                }
            }
        }

        print("Part one:", partOne)

        let partTwo = signals.reduce(0) {
            total, signal in
            total + decodeSignal(input: signal[0], output: signal[1])
        }

        print("Part two:", partTwo)

    } catch {
        print(error)
    }
}

main()
