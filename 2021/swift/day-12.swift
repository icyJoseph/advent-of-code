import Foundation

let filename = "../input/day-12.in"

func search(_ root: String, _ adj: [String: [String]], _ history: Set<String>, _ acc: [String], _ allow: String? = nil) -> [String] {
    let paths = acc.map {
        input in
        var next = input
        next.append("->\(root)")
        return next
    }

    if let nodes = adj[root] {
        var result = [String]()

        for node in nodes.filter({ $0 != "start" }) {
            var visited = Set<String>(history)

            if visited.contains(node) {
                continue
            }

            if allow == nil {
                if node.lowercased() == node {
                    visited.insert(node)
                }

                let localResult = search(node, adj, visited, paths)

                result.append(contentsOf: localResult)
            } else {
                if node == allow {
                    let localResult = search(node, adj, visited, paths)
                    result.append(contentsOf: localResult)
                } else {
                    if node.lowercased() == node {
                        visited.insert(node)
                    }
                    let localResult = search(node, adj, visited, paths, allow)
                    result.append(contentsOf: localResult)
                }
            }
        }

        return result
    }

    return paths
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let nodes = contents.split(separator: "\n").map { $0.split(separator: "-").map { String($0) } }

        var adj: [String: [String]] = [:]

        for node in nodes {
            adj[node[0], default: [String]()].append(node[1])
            adj[node[1], default: [String]()].append(node[0])
        }

        adj["end"] = nil

        let partOne = search("start", adj, Set(), ["start"])

        print("Part one:", partOne.count)

        let smallCaves = adj.keys.filter { $0.lowercased() == $0 }.filter { $0 != "start" }

        var partTwo = Set<String>()

        for cave in smallCaves {
            let result = search("start", adj, Set(), ["start"], cave)

            partTwo.formUnion(result)
        }

        print("Part two:", partTwo.count)

    } catch {
        print(error)
    }
}

main()
