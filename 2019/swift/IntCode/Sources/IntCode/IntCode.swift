public class IntCode {
    enum OpCode: Int {
        case add = 1
        case mult = 2

        case input
        case output

        case jumpTrue = 5
        case jumpFalse

        case lessThan
        case equal = 8

        case halt = 99
    }

    enum Mode: Int {
        case position = 0
        case immediate
    }

    public typealias Listener = (Int) -> Void

    var listener: Listener?

    public var memory: [Int]

    public init(_ initial: [Int]) {
        memory = initial
        listener = nil
        input = nil
        output = nil
    }

    public var input: Int?

    public var output: Int? {
        didSet {
            if let callback = listener, let arg = output {
                callback(arg)
            }
        }
    }

    public func connect(listener: @escaping Listener) {
        self.listener = listener
    }

    func calcModes(_ param: Int) -> [Mode] {
        var result = [Mode]()
        var next = param

        let div = 10

        while result.count < 3 {
            let raw = next % div

            next = next / 10

            switch Mode(rawValue: raw) {
            case .position:
                result.append(.position)
            case .immediate:
                result.append(.immediate)
            case .none:
                assertionFailure("Unexpected mode from: \(raw) - \(param)")
            }
        }

        return result
    }

    public func execute(verbose: Bool) {
        var pointer = 0
        var halt = false

        while true {
            if halt {
                if verbose {
                    print("HALT")
                }
                break
            }

            assert(memory.indices.contains(pointer), "Out of bounds! - \(pointer) in \(memory.count)")

            let cmd = OpCode(rawValue: memory[pointer] % 100)

            let modes = calcModes(memory[pointer] / 100)

            if verbose {
                print(pointer, memory[pointer])
            }

            switch cmd {
            case .add:
                let left = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let right = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                let result = left + right

                if modes[2] == .position {
                    memory[memory[pointer + 3]] = result
                } else {
                    memory[pointer + 3] = result
                }

                pointer += 4

            case .mult:
                let left = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let right = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                let result = left * right

                if modes[2] == .position {
                    memory[memory[pointer + 3]] = result
                } else {
                    memory[pointer + 3] = result
                }

                pointer += 4

            case .input:
                if modes[0] == .position {
                    memory[memory[pointer + 1]] = input ?? 0
                } else {
                    memory[pointer + 1] = input ?? 0
                }

                pointer += 2

            case .output:

                if modes[0] == .position {
                    output = memory[memory[pointer + 1]]
                } else {
                    output = memory[pointer + 1]
                }

                pointer += 2

            case .jumpTrue:

                let first = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let second = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                if first != 0 {
                    pointer = second
                } else {
                    pointer += 3
                }

            case .jumpFalse:
                let first = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let second = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                if first == 0 {
                    pointer = second
                } else {
                    pointer += 3
                }

            case .lessThan:
                let first = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let second = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                let result = first < second ? 1 : 0

                if modes[2] == .position {
                    memory[memory[pointer + 3]] = result
                } else {
                    memory[pointer + 3] = result
                }

                pointer += 4

            case .equal:

                let first = modes[0] == .position ? memory[memory[pointer + 1]] : memory[pointer + 1]
                let second = modes[1] == .position ? memory[memory[pointer + 2]] : memory[pointer + 2]

                let result = first == second ? 1 : 0

                if modes[2] == .position {
                    memory[memory[pointer + 3]] = result
                } else {
                    memory[pointer + 3] = result
                }

                pointer += 4

            case .halt:
                halt = true
            case .none:
                assertionFailure("Error hit: no op code, \(pointer), was \(memory[pointer])")
            }
        }
    }

    public func execute() {
        execute(verbose: false)
    }
}
