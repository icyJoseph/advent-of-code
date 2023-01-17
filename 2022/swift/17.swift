import Foundation

let filename = "./input/17.in"

struct Vector {
    var x: Int
    var y: Int

    static func + (lhs: Vector, rhs: Vector) -> Vector {
        Vector(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
    }
}

enum Cycle: CaseIterable {
    case minus; case plus; case invertedL; case bar; case square
}

enum Rock {
    case minus(Vector)
    case plus(Vector)
    case invertedL(Vector)
    case bar(Vector)
    case square(Vector)

    init(y: Int, cycle: Cycle) {
        switch cycle {
        case Cycle.minus:
            self = .minus(Vector(x: 2, y: y))

        case Cycle.plus:
            self = .plus(Vector(x: 2, y: y))

        case Cycle.invertedL:
            self = .invertedL(Vector(x: 2, y: y))

        case Cycle.bar:
            self = .bar(Vector(x: 2, y: y))

        case Cycle.square:
            self = .square(Vector(x: 2, y: y))
        }
    }

    func drift(_ delta: Vector) -> Rock {
        switch self {
        case let .minus(corner):
            return .minus(corner + delta)
        case let .plus(corner):
            return .plus(corner + delta)
        case let .invertedL(corner):
            return .invertedL(corner + delta)
        case let .bar(corner):
            return .bar(corner + delta)
        case let .square(corner):
            return .square(corner + delta)
        }
    }

    func fall() -> Rock {
        switch self {
        case .minus, .plus, .invertedL, .bar, .square:
            return drift(Vector(x: 0, y: -1))
        }
    }

    var shape: [Vector] {
        switch self {
        case let .minus(corner):
            return Array(0 ... 3).map {
                x in
                corner + Vector(x: x, y: 0)
            }
        case let .plus(corner):
            return [
                corner + Vector(x: 1, y: 2),
                corner + Vector(x: 0, y: 1),
                corner + Vector(x: 1, y: 1),
                corner + Vector(x: 2, y: 1),
                corner + Vector(x: 1, y: 0),
            ]

        case let .invertedL(corner):
            return [
                corner + Vector(x: 2, y: 2),
                corner + Vector(x: 2, y: 1),
                corner + Vector(x: 2, y: 0),
                corner + Vector(x: 1, y: 0),
                corner + Vector(x: 0, y: 0),
            ]

        case let .bar(corner):
            return Array(0 ... 3).map {
                y in
                corner + Vector(x: 0, y: y)
            }

        case let .square(corner):
            return [
                corner + Vector(x: 0, y: 1),
                corner + Vector(x: 1, y: 1),
                corner + Vector(x: 0, y: 0),
                corner + Vector(x: 1, y: 0),
            ]
        }
    }
}

class Jets {
    let jets: [Vector]

    private var index: Int = 0

    func next() -> Vector {
        let result = jets[index]

        index = (index + 1) % jets.count

        return result
    }

    func current() -> Int {
        return index
    }

    init(jets: [Vector]) {
        self.jets = jets
    }
}

class Falling {
    private var cycle: Cycle = .minus

    var settled: Int = 0

    func next(top: Int) -> Rock {
        // between the top of the stack
        // and the edge of the rock, there must be 3 rows
        // so the edge starts at 3 + 1
        let bottomEdge = top + 3 + 1

        let result = Rock(y: bottomEdge, cycle: cycle)

        switch cycle {
        case .minus:
            cycle = .plus
        case .plus:
            cycle = .invertedL
        case .invertedL:
            cycle = .bar
        case .bar:
            cycle = .square
        case .square:
            cycle = .minus
        }

        return result
    }

    func current() -> Cycle {
        return cycle
    }
}

class Tunnel {
    var levels = [[Bool]]()

    init() {
        levels = [Array(repeating: true, count: 7)]
    }

    func collides(rock: Rock) -> Bool {
        let shape = rock.shape

        for vec in shape {
            if vec.x < 0 || vec.x > 6 {
                return true
            }

            if vec.y < 1 {
                return true
            }

            if levels.count > vec.y {
                if levels[vec.y][vec.x] == true {
                    return true
                }
            }
        }

        return false
    }

    func add(_ vec: Vector) {
        if levels.indices.contains(vec.y) {
            levels[vec.y][vec.x] = true

        } else {
            while !levels.indices.contains(vec.y) {
                levels.append(Array(repeating: false, count: 7))
            }

            levels[vec.y][vec.x] = true
        }
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let jets = Jets(jets: Array(contents).map { $0 as Character }.map {
            $0 == "<" ? Vector(x: -1, y: 0) : Vector(x: 1, y: 0)
        }
        )

        let falling = Falling()

        let tunnel = Tunnel()

        var maxY = 0

        var current = falling.next(top: maxY)

        let limit = 2022

        var states = Set<String>()

        var dict = [String: Int]()

        var repetition = [Int]()

        while true {
            let jet = jets.next()

            // if this jet is the start
            // of the cache end
            if repetition.count > 0, states.count > 0, repetition.count == states.count {
                break
            }

            let drifted = current.drift(jet)

            current = tunnel.collides(rock: drifted) ? current : drifted

            let fallen = current.fall()

            let suffix = "\(jets.current()).\(falling.current())"

            if tunnel.collides(rock: fallen) {
                // settled

                let prev = maxY

                for vec in current.shape {
                    if vec.y > maxY {
                        maxY = vec.y
                    }

                    tunnel.add(vec)
                }

                let delta = maxY - prev

                if dict[suffix] == delta {
                    let state = "\(delta).\(suffix)"

                    if states.contains(state) {
                        if repetition.count < states.count {
                            repetition.append(delta)
                        }
                    } else {
                        repetition = []
                        states.insert(state)
                    }
                }

                dict[suffix] = delta

                falling.settled += 1

                if falling.settled == limit {
                    print("Part one:", maxY)
                }

                current = falling.next(top: maxY)

                continue
            }

            current = fallen
        }

        let todo = 1_000_000_000_000 - falling.settled

        maxY += (todo / repetition.count) * repetition.reduce(0, +)

        maxY += repetition.prefix(todo % repetition.count).reduce(0, +)

        print("Part two:", maxY)

    } catch {
        print(error)
    }
}

main()
