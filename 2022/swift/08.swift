import Foundation

let filename = "./input/08.in"

struct Point {
    let x: Int
    let y: Int

    init(_ x: Int, _ y: Int) {
        self.x = x
        self.y = y
    }

    func getRow(_ width: Int) -> (left: [Point], right: [Point]) {
        let left = Array(0 ..< x).reversed().map { Point($0, y) }

        let right = Array((x + 1) ..< width).map { Point($0, y) }

        return (left, right)
    }

    func getCol(_ height: Int) -> (up: [Point], down: [Point]) {
        let up = Array(0 ..< y).reversed().map { Point(x, $0) }
        let down = Array((y + 1) ..< height).map { Point(x, $0) }

        return (up, down)
    }
}

func findVisible(_ tree: (point: Point, value: Int), _ graph: [[(point: Point, value: Int)]]) -> [Point]? {
    let width = graph[0].count
    let height = graph.count

    let (left, right) = tree.point.getRow(width)
    let (up, down) = tree.point.getCol(height)

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

func calcScenicScore(_ tree: (point: Point, value: Int), _ graph: [[(point: Point, value: Int)]]) -> Int {
    let width = graph[0].count
    let height = graph.count

    let (left, right) = tree.point.getRow(width)
    let (up, down) = tree.point.getCol(height)

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

        let rows = contents.split(separator: "\n")

        // let graph = rows
        //     .enumerated()
        //     .map {
        //         entry in
        //         let (y, row) = entry
        //
        //         return (Array(row) as [Character])
        //             .compactMap { $0.wholeNumberValue }
        //             .enumerated()
        //
        //             .map { cell in
        //                 let (x, value) = cell
        //
        //                 return (Point(x, y), value)
        //             }
        //     }

        let grid = rows
            .map {
                entry in

                (Array(entry) as [Character])
                    .compactMap { $0.wholeNumberValue }
            }

        var graph = [[(Point, Int)]]()

        for y in 0 ..< grid.count {
            var row = [(Point, Int)]()
            for x in 0 ..< grid[0].count {
                row.append((Point(x, y), grid[y][x]))
            }

            graph.append(row)
        }

        let flat = graph.flatMap { $0 }

        print("Part one:", flat.compactMap { findVisible($0, graph) }.count)

        print("Part two:", flat.map { calcScenicScore($0, graph) }.max()!)

    } catch {
        print(error)
    }
}

main()
