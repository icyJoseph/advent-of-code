import Foundation

let filename = "./input/14.in"

struct Point: Hashable {
    let x: Int
    let y: Int

    func hash(into hasher: inout Hasher) {
        hasher.combine(x)
        hasher.combine(y)
    }

    static func == (lhs: Point, rhs: Point) -> Bool {
        return lhs.x == rhs.x && lhs.y == rhs.y
    }
}

struct Line {
    let from: Point
    let to: Point

    var points: [Point] {
        var result = [Point]()

        for y in min(from.y, to.y) ... max(from.y, to.y) {
            for x in min(from.x, to.x) ... max(from.x, to.x) {
                result.append(Point(x: x, y: y))
            }
        }

        return result
    }
}

struct Sand {
    var current: Point

    init(initial: Point) {
        current = initial
    }

    var candidates: [Point] {
        return [(0, 1), (-1, 1), (1, 1)].map {
            delta in
            let (dx, dy) = delta
            return Point(x: current.x + dx, y: current.y + dy)
        }
    }

    func tuple(walls: Set<Point>, stable: Set<Point>, floor: Int) -> Point? {
        candidates.first { !walls.contains($0) && !stable.contains($0) && $0.y < floor }
    }

    mutating func move(to: Point) {
        current = to
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let segments = contents.split(separator: "\n").map {
            row in

            row.replacingOccurrences(of: "->", with: "").split(separator: " ").map {
                point in
                let coord = point.components(separatedBy: ",").compactMap { Int($0) }

                return Point(x: coord[0], y: coord[1])
            }
        }

        guard let bottom = segments.flatMap({ $0 }).map({ $0.y }).max() else {
            print("No bottom found!")
            return
        }

        let walls = Set<Point>(segments.flatMap {
            points in
            points.enumerated().suffix(points.count - 1).map {
                index, point in
                Line(from: points[index - 1], to: point)
            }.flatMap {
                line in
                line.points
            }
        })

        var stable = Set<Point>()

        var maxY = 0

        let initial = Point(x: 500, y: 0)

        var sand = [Sand(initial: initial)]

        while sand.count > 0 {
            sand = sand.compactMap {
                var grain = $0

                guard let next = grain.tuple(walls: walls, stable: stable, floor: bottom + 2) else {
                    stable.insert(grain.current)

                    return nil
                }

                grain.move(to: next)

                if next.y > maxY {
                    maxY = next.y
                }

                return grain
            }

            if maxY == bottom {
                print("Part one:", stable.count)
            }

            if !stable.contains(initial) {
                sand.append(Sand(initial: initial))
            }
        }

        print("Part two:", stable.count)

    } catch {
        print(error)
    }
}

main()
