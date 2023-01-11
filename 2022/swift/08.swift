import Foundation

let filename = "./input/08.in"

typealias Point = (x: Int, y: Int)
typealias Tree = (point: Point, value: Int)
typealias Grid = [[Tree]]

func firstTaller(_ from: Int, _ height: Int, _ list: [Tree], _ seed: [Int?] = [nil, nil]) -> [Int?] {
    var result: [Int?] = seed

    var leftIt = from - 1
    var rightIt = from + 1

    while leftIt >= 0 {
        if height <= list[leftIt].value {
            result[0] = leftIt
            break
        }

        leftIt -= 1
    }

    while rightIt < list.count {
        if height <= list[rightIt].value {
            result[1] = rightIt
            break
        }

        rightIt += 1
    }

    return result
}

func isVisible(_ tree: Tree, _ rows: Grid, _ cols: Grid) -> Bool {
    let (x, y) = tree.point

    let h = firstTaller(x, tree.value, rows[y]).compactMap { $0 }
    let v = firstTaller(y, tree.value, cols[x]).compactMap { $0 }

    // if a tree is blocked in 4 directions, it is invisible from the edges
    return (h.count + v.count) != 4
}

func calcScenicScore(_ tree: (point: Point, value: Int), _ rows: Grid, _ cols: Grid) -> Int {
    let (x, y) = tree.point

    let h = firstTaller(x, tree.value, rows[y], [0, rows.count - 1])
    let v = firstTaller(y, tree.value, cols[x], [0, cols.count - 1])

    let hCount = h.compactMap { $0 }.map { abs($0 - x) }.reduce(1,*)
    let vCount = v.compactMap { $0 }.map { abs($0 - y) }.reduce(1,*)

    return hCount * vCount
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let value = contents.split(separator: "\n")
            .map {
                entry in

                (Array(entry) as [Character])
                    .compactMap { $0.wholeNumberValue }
            }

        // Left hand side type assignment cut down the timing from 10 secs to around 1 sec
        var cols: Grid = Array(repeating: [Tree](), count: value.count)
        var rows: Grid = []

        for y in 0 ..< value.count {
            var row = [Tree]()

            for x in 0 ..< value[0].count {
                let entry = (Point(x, y), value[y][x])

                cols[x].append(entry)
                row.append(entry)
            }

            rows.append(row)
        }

        let flat = rows.flatMap { $0 }

        print("Part one:", flat.filter { isVisible($0, rows, cols) }.count)

        print("Part two:", flat.map { calcScenicScore($0, rows, cols) }.max()!)

    } catch {
        print(error)
    }
}

main()
