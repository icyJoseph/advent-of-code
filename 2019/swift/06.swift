import Foundation

func takeFirst<T>(_ list: inout [T]) -> T? {
    list.count == 0 ? nil : list.removeFirst()
}

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    let rows = contents.split(separator: "\n")

    var children: [String: [String]] = [:]
    var parent: [String: String] = [:]

    for row in rows {
        let spec = row.split(separator: ")").map { String($0) }

        children[spec[0], default: [String]()].append(spec[1])

        parent[spec[1]] = spec[0]
    }

    var totalOrbits = 0

    for (current, _) in parent {
        var next = current

        while let orbit = parent[next] {
            totalOrbits += 1

            next = orbit
        }
    }

    print("Part one:", totalOrbits)

    let YOU = "YOU"
    let SAN = "SAN"

    guard let start = parent[YOU], let end = parent[SAN] else {
        return
    }

    var current = start

    var totalTransfers = 0

    while current != end {
        guard var q = children[current]?.map({ ($0, 1) }) else {
            return
        }

        while let (next, depth) = takeFirst(&q) {
            if let nodes = children[next] {
                if nodes.contains(SAN) {
                    current = next
                    totalTransfers += depth

                    break
                }

                for node in nodes {
                    q.append((node, depth + 1))
                }
            }
        }

        if current != end {
            // move up to parent
            guard let next = parent[current] else {
                return
            }

            current = next

            totalTransfers += 1
        }
    }

    print("Part two:", totalTransfers)
}

let filename = "./input/06.in"

main(filename)
