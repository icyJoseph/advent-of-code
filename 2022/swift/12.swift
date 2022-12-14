import Foundation

let filename = "./input/12.in"

func coordToIndex(_ coords: (x: Int, y: Int), _ width: Int) -> Int {
    coords.y * width + coords.x
}

func indexToCoord(_ index: Int, _ width: Int) -> (x: Int, y: Int) {
    (index % width, index / width)
}

// create adjacent matrix
func calcAdj<T>(_ graph: [T], _ width: Int) -> [[Int]] {
    var adjacent: [[Int]] = []

    let height = graph.count / width

    for (index, _) in graph.enumerated() {
        var localAdj: [Int] = []
        let (x, y) = indexToCoord(index, width)

        let up = (x, y - 1)
        let down = (x, y + 1)
        let left = (x - 1, y)
        let right = (x + 1, y)

        if up.1 >= 0 {
            localAdj.append(coordToIndex(up, width))
        }

        if down.1 < height {
            localAdj.append(coordToIndex(down, width))
        }

        if left.0 >= 0 {
            localAdj.append(coordToIndex(left, width))
        }

        if right.0 < width {
            localAdj.append(coordToIndex(right, width))
        }

        adjacent.append(localAdj)
    }

    return adjacent
}

struct Queue<Element> {
    var items: [Element] = []
    mutating func push(_ item: Element) {
        items.append(item)
    }

    mutating func pop() -> Element {
        return items.removeLast()
    }

    mutating func front() -> Element {
        return items.remove(at: 0)
    }

    func empty() -> Bool {
        return items.count == 0
    }
}

func bfs(_ root: Int, _ end: Int, _ graph: [Character], _ adj: [[Int]]) -> Int {
    var queue = Queue<Int>()
    var visited = graph.map { _ in
        false
    }

    var distances: [Int] = graph.map { _ in 0 }

    visited[root] = true
    distances[root] = 0
    distances[end] = graph.count

    queue.push(root)

    while !queue.empty() {
        let next = queue.front()

        for node in adj[next] {
            if visited[node] { continue }

            let peak = graph[node].asciiValue!
            let current = graph[next].asciiValue!

            if peak <= current + 1 {
                visited[node] = true

                distances[node] = distances[next] + 1

                if node != end {
                    queue.push(node)
                }
            }
        }
    }

    return distances[end]
}

func bfs_backwards(_ end: Int, _ graph: [Character], _ adj: [[Int]]) -> Int? {
    var queue = Queue<Int>()
    var visited = graph.map { _ in false }

    var distances = graph.map { _ in 0 }

    var shortest: Int?

    visited[end] = true
    distances[end] = 0

    queue.push(end)

    while !queue.empty() {
        let next = queue.front()

        for node in adj[next] {
            if visited[node] { continue }

            let peak = graph[node].asciiValue!
            let current = graph[next].asciiValue!

            if peak + 1 >= current {
                visited[node] = true

                distances[node] = distances[next] + 1

                if graph[node] != "a" {
                    queue.push(node)
                } else {
                    if shortest == nil || distances[node] < shortest! {
                        shortest = distances[node]
                    }
                }
            }
        }
    }

    return shortest
}

func flatGraph<T>(_ graph: [[T]]) -> [T] {
    var flat: [T] = []

    for row in graph {
        flat.append(contentsOf: row)
    }

    return flat
}

func main() {
    do {
        let rows: [[Character]] = try String(contentsOfFile: filename).split(separator: "\n").map { Array(String($0)) }

        let width = rows[0].count

        var root = 0
        var end = 0

        rows.enumerated().forEach { entry in
            let (y, row) = entry
            row.enumerated().forEach { cell in
                let (x, value) = cell

                if value == "S" {
                    let index = coordToIndex((x, y), width)
                    root = index
                }

                if value == "E" {
                    end = coordToIndex((x, y), width)
                }
            }
        }

        var graph = flatGraph(rows)

        graph[root] = "a"
        graph[end] = "z"

        let adj = calcAdj(graph, width)

        let shortestFromRoot = bfs(root, end, graph, adj)

        print("Part one:", shortestFromRoot)

        let shortestFromEnd = bfs_backwards(end, graph, adj)!

        print("Part two:", shortestFromEnd)
    } catch {
        print(error)
    }
}

main()
