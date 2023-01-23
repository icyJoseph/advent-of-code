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

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.components(separatedBy: "\n")

        var monkeys: Jungle = [:]

        for spec in rows {
            let monkey = Monkey(spec)
            monkeys[monkey.label] = monkey
        }

        guard let root = monkeys["root"] else {
            assertionFailure("No root monkey")
            return
        }

        print("Part one:", root.query(monkeys))

    } catch {
        print(error)
    }
}

main()
