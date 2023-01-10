import Foundation

let filename = "./input/09.in"

typealias Point = (x: Int, y: Int)

func sign(_ num: Int) -> Int {
    num > 0 ? 1 : -1
}

func dist(_ lhs: Point, _ rhs: Point) -> Int {
    abs(rhs.x - lhs.x) + abs(rhs.y - lhs.y)
}

func touching(_ lhs: Point, _ rhs: Point) -> Bool {
    let vec = [0, 1, -1]

    return vec.first {
        dx in
        vec.first { dy in
            (lhs.x + dx) == rhs.x && (lhs.y + dy) == rhs.y
        } != nil
    } != nil
}

func follow(_ current: Point, _ lead: Point) -> Point {
    // same col
    if lead.x == current.x {
        if dist(lead, current) >= 2 {
            if lead.y < current.y {
                // lead is above
                return (x: 0, y: -1)
            }
            return (x: 0, y: 1)
        }
    }

    // same row
    if lead.y == current.y {
        if dist(lead, current) >= 2 {
            if lead.x < current.x {
                return (x: -1, y: 0)
            }
            return (x: 1, y: 0)
        }
    }

    if !touching(lead, current) {
        let dx = sign(lead.x - current.x)
        let dy = sign(lead.y - current.y)

        return (x: dx, y: dy)
    }

    return (x: 0, y: 0)
}

class Knot {
    var point: Point {
        didSet {
            coverage.insert("\(point.x).\(point.y)")
        }
    }

    var coverage: Set<String>

    init(_ point: Point) {
        self.point = point
        coverage = Set<String>()
        coverage.insert("\(point.x).\(point.y)")
    }

    func move(_ by: Point) {
        let (dx, dy) = by
        point = (point.x + dx, point.y + dy)
    }
}

typealias Simulate = ([Knot]) -> Void

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let instructions = contents.split(separator: "\n").map {
            row in
            let entry = row.split(separator: " ")
            let delta = Int(entry[1])!

            switch entry[0] {
            case "L":
                return (x: -delta, y: 0)
            case "R":
                return (x: delta, y: 0)
            case "U":
                return (x: 0, y: -delta)
            case "D":
                return (x: 0, y: delta)
            default:
                return (0, 0)
            }
        }

        let simulate: Simulate = {
            rope in

            for inst in instructions {
                rope[0].move(inst)

                let body = rope.suffix(rope.count - 1).enumerated()

                while !body.allSatisfy({ touching($0.1.point, rope[$0.0].point) }) {
                    for (index, knot) in body {
                        knot.move(follow(knot.point, rope[index].point))
                    }
                }
            }
        }

        let head = Knot((x: 0, y: 0))
        let tail = Knot((x: 0, y: 0))

        let rope = [head, tail]

        simulate(rope)

        print("Part one:", tail.coverage.count)

        let longRope = Array(0 ... 9).map { _ in Knot((x: 0, y: 0)) }

        simulate(longRope)

        print("Part two:", longRope[longRope.count - 1].coverage.count)

    } catch {
        print(error)
    }
}

main()
