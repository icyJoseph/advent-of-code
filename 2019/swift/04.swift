import Foundation

let filename = "./input/04.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let range = contents.split(separator: "-").compactMap { Int($0) }

        var loose = 0

        var strict = 0

        for pwd in range[0] ... range[1] {
            var curr = pwd

            var digits = [Int]()
            var div = 100_000

            while div != 0 {
                let d = curr / div

                curr = curr % div
                div = div / 10

                digits.append(d)
            }

            let withIndex = digits.enumerated().map { $0 }.suffix(from: 1)

            let nonDecreasing = withIndex.allSatisfy {
                entry in
                let (index, digit) = entry

                return digits[index - 1] <= digit
            }

            let adjacency = withIndex.contains {
                entry in

                let (index, digit) = entry

                return digits[index - 1] == digit
            }

            if nonDecreasing, adjacency {
                loose += 1
            }

            let groups = digits.reduce([(digit: Int, count: Int)]()) {
                acc, digit in
                var next = acc

                if next.count == 0 {
                    next.append((digit: digit, count: 1))
                    return next
                }

                if next[next.count - 1].digit == digit {
                    next[next.count - 1].count += 1
                    return next
                }

                next.append((digit: digit, count: 1))

                return next
            }

            let twoAdjacency = groups.contains { $0.count == 2 }

            if nonDecreasing, twoAdjacency {
                strict += 1
            }
        }

        print("Part one: ", loose)
        print("Part two: ", strict)

    } catch {
        print(error)
    }
}

main()
