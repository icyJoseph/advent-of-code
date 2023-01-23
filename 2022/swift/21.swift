import Foundation

let filename = "./input/21.in"

enum Op {
    case sum; case prod; case sub; case div

    init(_ arg: String) {
        switch arg {
        case "+":
            self = Op.sum

        case "*":
            self = Op.prod

        case "-":
            self = Op.sub

        case "/":
            self = Op.div

        default:
            self = Op.sum
            assertionFailure("Invalid Operation \(arg)")
        }
    }

    func execute(_ lhs: Int, _ rhs: Int) -> Int {
        switch self {
        case .sum:
            return lhs + rhs

        case .prod:
            return lhs * rhs

        case .sub:
            return lhs - rhs

        case .div:
            return lhs / rhs
        }
    }
}

typealias Jungle = [String: Monkey]

enum Monkey {
    indirect case Compute(label: String, lhs: String, rhs: String, op: Op)
    case Input(label: String, value: Int)

    init(_ spec: String) {
        let parts = spec.replacingOccurrences(of: ":", with: "").components(separatedBy: " ")

        if let value = Int(parts[1]) {
            self = .Input(label: parts[0], value: value)
        } else {
            self = .Compute(label: parts[0], lhs: parts[1], rhs: parts[3], op: Op(parts[2]))
        }
    }

    mutating func update(_ op: Op) {
        switch self {
        case let .Compute(label: label, lhs: lhs, rhs: rhs, _):
            self = .Compute(label: label, lhs: lhs, rhs: rhs, op: op)
        default:
            break
        }
    }

    mutating func tune(_ by: Int) {
        switch self {
        case let .Input(label: label, value: current):
            self = .Input(label: label, value: current + by)
        default:
            break
        }
    }

    func query(_ monkeys: Jungle) -> Int {
        switch self {
        case let .Input(label: _, value: value):
            return value

        case let .Compute(label: label, lhs: lhs, rhs: rhs, op: op):
            guard let left = monkeys[lhs], let right = monkeys[rhs] else {
                assertionFailure("No inputs monkeys, \(label): \(lhs), \(rhs)")
                return 0
            }

            return op.execute(left.query(monkeys), right.query(monkeys))
        }
    }

    var label: String {
        switch self {
        case let .Input(label: label, _), let .Compute(label: label, _, _, _):
            return label
        }
    }
}

func sign(_ n: Int) -> Int {
    if n == 0 { return 0 }

    return n > 0 ? 1 : -1
}

func queryMonkey(_ label: String, _ dict: Jungle) -> Int {
    guard let monkey = dict[label] else {
        assertionFailure("No \(label) found")
        return 0
    }

    return monkey.query(dict)
}

let root = "root"
let human = "humn"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.components(separatedBy: "\n")

        var monkeys: Jungle = [:]

        for spec in rows {
            let monkey = Monkey(spec)
            monkeys[monkey.label] = monkey
        }

        print("Part one:", queryMonkey(root, monkeys))

        if var node = monkeys[root] {
            node.update(Op.sub)
            monkeys[root] = node
        }

        var result = queryMonkey(root, monkeys)
        var prev = result
        var step = 1_000_000_000_000

        while result != 0 {
            // zero cross
            // if we cross zero, change direction
            // but with a shorter stride
            if sign(prev) != sign(result) {
                let dir = sign(step) * -1
                step = (dir * abs(step)) / 10
            }

            // if result shoots away from zero
            // go in other directionn
            if abs(prev) < abs(result) {
                let dir = sign(step) * -1
                step = dir * abs(step)
            }

            prev = result

            if var node = monkeys[human] {
                node.tune(step)
                monkeys[human] = node
            }

            result = queryMonkey(root, monkeys)
        }

        print("Part two:", queryMonkey(human, monkeys))

    } catch {
        print(error)
    }
}

main()
