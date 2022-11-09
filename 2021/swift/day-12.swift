import Foundation

let filename = "../input/day-12.in"

func search(_ root: String, _ adj: [String: [String]], _ history: Set<String>, _ acc: inout Int) {
    if root == "end" {
        acc += 1
    } else if let nodes = adj[root] {
        for node in nodes.filter({ $0 != "start" }) {
            var visited = Set<String>(history)

            if visited.contains(node) {
                continue
            }

            if node.lowercased() == node {
                visited.insert(node)
            }

            search(node, adj, visited, &acc)
        }

    } else {
        print("Error", root, "had no adjacent members")
    }
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

        var partOne = 0

        search("start", adj, Set(), &partOne)

        print("Part one:", partOne)
    } catch {
        print(error)
    }
}

main()
