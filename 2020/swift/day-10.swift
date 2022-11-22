import Foundation

let filename = "../input/day-10.in"

func main() {
    do {
        var jolts = try String(contentsOfFile: filename).split(separator: "\n").map { Int($0)! }.sorted()

        jolts.insert(0, at: 0)
        jolts.append(jolts[jolts.count - 1] + 3)

        let diffs = jolts.enumerated().map {
            entry in
            let (index, value) = entry
            if index == 0 {
                return value
            }
            // list is sorted ASC
            return value - jolts[index - 1]
        }

        let delta3 = diffs.filter { $0 == 3 }.count
        let delta1 = diffs.filter { $0 == 1 }.count

        print("Part one:", delta3 * delta1)

        // For every node, n, all combinations that must pass through there
        // are found by adding all of the paths up to node, n - j, such that
        // the difference is at most 3, at the end we collect
        // the value of the last node

        let total = jolts.enumerated().reduce([Int]()) {
            acc, entry in
            let (index, value) = entry
            var next = acc

            if index == 0 { return [1] }

            // add to the accumulator, in how many ways we can reach this node
            // by looking at how many times nodes, at most at 3 distance, can be
            // reached, and adding all of them up
            let count = jolts[..<index]
                .enumerated()
                .filter { value - $0.1 <= 3 }
                .map { acc[$0.0] }
                .reduce(0, +)

            next.append(count)

            return next
        }

        print("Part two:", total[jolts.count - 1])

    } catch {
        print(error)
    }
}

main()
