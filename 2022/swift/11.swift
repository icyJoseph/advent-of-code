import Foundation

let filename = "./input/11.in"

class Box<T> {
    let value: T

    init(_ thing: T) {
        value = thing
    }
}

struct Item {
    var value: Int

    var mods: [Int: Int]

    init(_ val: Int, _ divs: [Int]) {
        value = val

        mods = divs.map { ($0, val % $0) }.reduce(into: [:]) { $0[$1.0] = $1.1 }
    }

    mutating func updateValue(_ next: Int) {
        value = next
    }

    mutating func updateMod(_ key: Int, _ value: Int) {
        mods[key] = value
    }
}

struct Operation {
    typealias Closure = (Int, Int) -> Int

    let closure: Closure

    let left: String
    let right: String

    private static func getClosure(_ op: String) -> Closure {
        switch op {
        case "+":
            return { lhs, rhs in lhs + rhs }
        case "*":
            return { lhs, rhs in lhs * rhs }
        default:
            return { _, _ in 0 }
        }
    }

    init(_ op: String, _ lhs: String, _ rhs: String) {
        left = lhs
        right = rhs
        closure = Operation.getClosure(op)
    }

    private func getArgs(_ item: Int) -> (Int, Int) {
        let rhs = Int(right)

        return (item, rhs == nil ? item : rhs!)
    }

    func execute(_ old: Item, _ relaxed: Bool) -> Item {
        var item = old

        if relaxed {
            let (lhs, rhs) = getArgs(item.value)
            item.updateValue(closure(lhs, rhs) / 3)
        } else {
            for (key, value) in item.mods {
                let (lhs, rhs) = getArgs(value)
                item.updateMod(key, closure(lhs, rhs) % key)
            }
        }

        return item
    }
}

class Monkey {
    let operation: Operation
    let div: Int
    let relaxed: Bool

    var items: [Item]
    var inspected: Int = 0

    private var whenTrue: Box<Monkey>?
    private var whenFalse: Box<Monkey>?

    init(_ initial: [Item], _ div: Int, _ operation: Operation, _ relaxed: Bool) {
        items = initial
        self.div = div
        self.relaxed = relaxed
        self.operation = operation
    }

    func setTest(_ whenTrue: Box<Monkey>, _ whenFalse: Box<Monkey>) {
        self.whenTrue = whenTrue
        self.whenFalse = whenFalse
    }

    func receive(_ next: Item) {
        items.append(next)
    }

    func dispatch() {
        inspected += items.count

        for item in items {
            let payload = operation.execute(item, relaxed)

            if relaxed {
                if payload.value % div == 0 {
                    whenTrue!.value.receive(payload)
                } else {
                    whenFalse!.value.receive(payload)
                }
            } else {
                if payload.mods[div]! % div == 0 {
                    whenTrue!.value.receive(payload)
                } else {
                    whenFalse!.value.receive(payload)
                }
            }
        }

        items = []
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let simulate: (Int, Bool, [Int]) -> Int = {
            rounds, relaxed, divs in
            typealias MonkeyList = [(monkey: Monkey, whenTrue: Int, whenFalse: Int)]

            let monkeyList: MonkeyList = contents.components(separatedBy: "\n\n").map {
                data in
                let rows = data.replacingOccurrences(of: ",", with: "").split(separator: "\n")

                let items = rows[1].split(separator: " ").compactMap { Int(String($0)) }.map { Item($0, divs) }

                let spec = rows[2].split(separator: "=")[1].split(separator: " ").map { String($0) }

                let op = spec[1]
                let lhs = spec[0]
                let rhs = spec[2]

                let operation = Operation(op, lhs, rhs)

                let div = rows[3].split(separator: " ").compactMap { Int($0) }[0]

                let whenTrue = rows[4].split(separator: " ").compactMap { Int($0) }[0]
                let whenFalse = rows[5].split(separator: " ").compactMap { Int($0) }[0]

                return (monkey: Monkey(items, div, operation, relaxed), whenTrue: whenTrue, whenFalse: whenFalse)
            }

            for (monkey, whenTrue, whenFalse) in monkeyList {
                monkey.setTest(Box(monkeyList[whenTrue].monkey), Box(monkeyList[whenFalse].monkey))
            }

            let monkeys = monkeyList.map { $0.monkey }

            for _ in 1 ... rounds {
                monkeys.forEach {
                    $0.dispatch()
                }
            }

            let inspected = monkeys.map { $0.inspected }.sorted()

            return inspected.suffix(2).reduce(1, *)
        }

        let divs = contents.components(separatedBy: "\n\n").map {
            data in
            let rows = data.replacingOccurrences(of: ",", with: "").split(separator: "\n")

            let div = rows[3].split(separator: " ").compactMap { Int($0) }[0]

            return div
        }

        print("Part one:", simulate(20, true, divs))
        print("Part two:", simulate(10000, false, divs))

    } catch {
        print(error)
    }
}

main()
