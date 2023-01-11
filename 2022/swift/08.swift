import Foundation

let filename = "./input/08.in"

struct Point {
    let x: Int
    let y: Int

    init(_ x: Int, _ y: Int) {
        self.x = x
        self.y = y
    }
}

typealias Graph = [[(point: Point, value: Int)]]

func findVisible(_ tree: (point: Point, value: Int), _ graph: Graph, _ cols: Graph) -> [Point]? {
    let x = tree.point.x
    let y = tree.point.y

    let left = graph[y][0 ..< x].map { $0.point }
    let right = graph[y][(x + 1)...].map { $0.point }

    let up = cols[x][0 ..< y].map { $0.point }
    let down = cols[x][(y + 1)...].map { $0.point }

    let isTaller: (Point) -> Bool = {
        op in
        let other = graph[op.y][op.x].value

        return tree.value <= other
    }

    // finds a direction on which the tree is visible
    return [left, right, up, down].first {
        trees in
        trees.count == 0 || trees.first { isTaller($0) } == nil
    }
}

func calcScenicScore(_ tree: (point: Point, value: Int), _ graph: Graph, _ cols: Graph) -> Int {
    let x = tree.point.x
    let y = tree.point.y

    let left = graph[y][0 ..< x].reversed().map { $0.point }
    let right = graph[y][(x + 1)...].map { $0.point }

    let up = cols[x][0 ..< y].reversed().map { $0.point }
    let down = cols[x][(y + 1)...].map { $0.point }

    let isTaller: (Point) -> Bool = {
        op in
        let other = graph[op.y][op.x].value

        return tree.value <= other
    }

    return [left, right, up, down].map {
        trees in
        if trees.count == 0 {
            return 0
        }

        if let index = trees.firstIndex(where: isTaller) {
            return index + 1
        } else {
            return trees.count
        }
    }
    .reduce(1, *)
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let grid = contents.split(separator: "\n")
            .map {
                entry in

                (Array(entry) as [Character])
                    .compactMap { $0.wholeNumberValue }
            }

        var cols = Array(repeating: [(Point, Int)](), count: grid.count)

        var graph = [[(Point, Int)]]()

        for y in 0 ..< grid.count {
            var row = [(Point, Int)]()
            for x in 0 ..< grid[0].count {
                let entry = (Point(x, y), grid[y][x])
                cols[x].append(entry)
                row.append(entry)
            }

            graph.append(row)
        }

        let flat = graph.flatMap { $0 }

        print("Part one:", flat.compactMap { findVisible($0, graph, cols) }.count)

        print("Part two:", flat.map { calcScenicScore($0, graph, cols) }.max()!)

    } catch {
        print(error)
    }
}

main()
