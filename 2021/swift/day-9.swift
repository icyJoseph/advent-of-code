import Foundation

let filename = "../input/day-9.in"

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

// perform actual BFS
func bfs<T>(_ root: Int, _ graph: [T], _ adj: [[Int]]) -> [Int] {
    var queue = Queue<Int>()
    var visited = graph.map { _ in
        false
    }

    var distances: [Int] = graph.map { _ in 0 }

    visited[root] = true
    distances[root] = 0

    queue.push(root)

    while !queue.empty() {
        let next = queue.front()

        for node in adj[next] {
            if visited[node] { continue }

            visited[node] = true
            distances[node] = distances[next] + 1
            queue.push(node)
        }
    }

    return distances
}

// turn a 2d graph into 1d
func flatGraph<T>(_ graph: [[T]]) -> [T] {
    var flat: [T] = []

    for row in graph {
        flat.append(contentsOf: row)
    }

    return flat
}

func prettyPrint<T>(_ graph: [T], _ width: Int, format: (T) -> String) {
    for lead in 0 ..< graph.count / width {
        let from = lead * width
        let to = from + width - 1
        let row = graph[from ... to].map { format($0) }
        print(row.joined(separator: " "))
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let grid = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: "\n").map {
            row in
            row.split(separator: "").map { Int($0)! }
        }

        let width = grid[0].count

        let graph = flatGraph(grid)

        let adj = calcAdj(graph, width)

        let partOne = graph.enumerated().reduce(0) {
            acc, curr in
            let (index, node) = curr

            return acc + (adj[index].allSatisfy { graph[$0] > node } ? 1 + node : 0)
        }

        print("Part one:", partOne)

    } catch { print(error) }
}

main()
