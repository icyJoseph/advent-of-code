import IntCode

class Amplifier {
    var machine: IntCode

    init(program: [Int], phase: Int) {
        machine = IntCode(program)

        machine.input = phase
    }

    var halted: Bool {
        machine.halted
    }

    func execute(signal: Int) -> Int? {
        machine.execute()

        var done = false

        machine.connect {
            _ in
            done = true
        }

        while !done {
            machine.input = signal

            machine.execute()
        }

        return machine.output
    }
}

typealias Setting = (Int, Int, Int, Int, Int)

func combination(_ from: Int, _ to: Int) -> [[Int]] {
    let count = to - from + 1
    var result = [[Int]]()

    var permutation = [Int]()
    var chosen = Array(repeating: false, count: count)

    func expand() {
        if permutation.count == count {
            result.append(permutation)
        } else {
            for current in from ... to {
                let index = current - from

                if chosen[index] {
                    continue
                }

                chosen[index] = true

                permutation.append(current)

                expand()

                chosen[index] = false
                permutation.removeLast()
            }
        }
    }

    expand()

    return result
}

public struct AmplificationCircuit {
    public init() {}

    public func run(_ input: String) {
        let program = input.split(separator: ",").compactMap { Int($0) }

        var maxOpenLoop = 0

        for settings in combination(0, 4) {
            let amps = settings.map { Amplifier(program: program, phase: $0) }

            let booster = amps.reduce(0) {
                signal, amp in

                guard let output = amp.execute(signal: signal) else {
                    assertionFailure("Amp generated nil output")
                    return signal
                }

                return output
            }

            if maxOpenLoop < booster {
                maxOpenLoop = booster
            }
        }

        print("Part one:", maxOpenLoop)

        var maxClosedLoop = 0

        for settings in combination(5, 9) {
            var booster = 0

            let amps = settings.map { Amplifier(program: program, phase: $0) }

            while amps.allSatisfy({ !$0.halted }) {
                booster = amps.reduce(booster) {
                    signal, amp in

                    guard let output = amp.execute(signal: signal) else {
                        assertionFailure("Amp generated nil output")
                        return signal
                    }

                    return output
                }
            }

            if maxClosedLoop < booster {
                maxClosedLoop = booster
            }
        }

        print("Part two:", maxClosedLoop)
    }
}
