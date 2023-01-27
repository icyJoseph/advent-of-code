import Foundation

let filename = "./input/03.in"

struct Point {
    var x: Int
    var y: Int

    func distance(to: Point) -> Int {
        abs(x - to.x) + abs(y - to.y)
    }

    static func + (lhs: Point, rhs: Point) -> Point {
        Point(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
    }

    static func == (lhs: Point, rhs: Point) -> Bool {
        lhs.x == rhs.x && lhs.y == rhs.y
    }

    static func != (lhs: Point, rhs: Point) -> Bool {
        lhs.x != rhs.x || lhs.y != rhs.y
    }
}

struct Vector {
    var from: Point
    var to: Point

    init(from: Point, to: Point) {
        self.from = from
        self.to = to
    }

    var isHorizontal: Bool {
        from.y == to.y
    }

    var isVertical: Bool {
        from.x == to.x
    }

    var length: Int {
        from.distance(to: to)
    }

    func parallel(with other: Vector) -> Bool {
        return isHorizontal && other.isHorizontal || isVertical && other.isVertical
    }

    func crossPoint(with other: Vector) -> Point? {
        if parallel(with: other) {
            return nil
        }

        if isHorizontal {
            // self is horizontal

            let inXBound = min(from.x, to.x) <= other.from.x && other.from.x <= max(from.x, to.x)
            let yCross = min(other.from.y, other.to.y) <= from.y && from.y <= max(other.from.y, other.to.y)

            if inXBound, yCross {
                return Point(x: other.from.x, y: from.y)
            }

            return nil
        }

        return other.crossPoint(with: self)
    }

    func contains(point: Point) -> Bool {
        if isHorizontal {
            return point.y == from.y && min(from.x, to.x) <= point.x && point.x <= max(from.x, to.x)
        }
        return point.x == from.x && min(from.y, to.y) <= point.y && point.y <= max(from.y, to.y)
    }
}

class Wire {
    let segments: [Vector]

    init(input: String) {
        segments = input.split(separator: ",").reduce([Vector]()) {
            acc, current in
            let spec = Array(current) as [Character]
            let dir = spec[0]
            let distance = spec.suffix(from: 1).compactMap { $0.wholeNumberValue }.reduce(0) { 10 * $0 + $1 }

            var to = Point(x: 0, y: 0)

            switch dir {
            case "U":
                to.y -= distance
            case "D":
                to.y += distance
            case "R":
                to.x += distance
            case "L":
                to.x -= distance
            default:
                assertionFailure("\(dir) is not a valid direction")
            }

            var next = acc

            if next.count == 0 {
                let origin = Point(x: 0, y: 0)

                next.append(Vector(from: origin, to: to))

                return next
            }

            let prev = next[next.count - 1].to

            next.append(Vector(from: prev, to: prev + to))

            return next
        }
    }

    func distance(point: Point) -> Int {
        var acc = 0

        for segment in segments {
            if segment.contains(point: point) {
                acc += segment.from.distance(to: point)
                break
            }

            acc += segment.length
        }

        return acc
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let wires = contents.components(separatedBy: "\n")

        let left = Wire(input: wires[0])
        let right = Wire(input: wires[1])

        var crossPoints = [Point]()

        for ls in left.segments {
            for rs in right.segments {
                if let point = rs.crossPoint(with: ls) {
                    crossPoints.append(point)
                }
            }
        }

        let origin = Point(x: 0, y: 0)

        let intersections = crossPoints.filter { $0 != origin }

        guard let closest = intersections.map({ $0.distance(to: origin) }).min() else {
            assertionFailure("Could not find closest")
            return
        }

        print("Part one:", closest)

        var distances = [Int]()

        for point in intersections {
            distances.append(left.distance(point: point) + right.distance(point: point))
        }

        guard let shortest = distances.min() else {
            assertionFailure("Could not find shortest")
            return
        }

        print("Part two:", shortest)

    } catch {
        print(error)
    }
}

main()
