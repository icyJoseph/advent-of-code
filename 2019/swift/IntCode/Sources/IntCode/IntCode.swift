public class Memory {
    var memory: [Int]

    init(_ program: [Int]) {
        memory = program
    }

    func resize(to: Int) {
        while !memory.indices.contains(to) {
            memory.append(0)
        }
    }

    public func debug() {
        print(memory)
    }

    public subscript(_ index: Int) -> Int {
        get {
            if !memory.indices.contains(index) {
                resize(to: index)
            }
            return memory[index]
        }
        set {
            if !memory.indices.contains(index) {
                resize(to: index)
            }
            memory[index] = newValue
        }
    }

    var count: Int {
        memory.count
    }

    var indices: Range<Array<Int>.Index> {
        memory.indices
    }
}

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

        case relative

        case halt = 99
    }

    enum Mode: Int {
        case position = 0
        case immediate
        case relative
    }

    public typealias Listener = (Int) -> Void

    var listener: Listener?

    public var memory: Memory

    public init(_ initial: [Int]) {
        memory = Memory(initial)
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
            case .relative:
                result.append(.relative)
            case .none:
                assertionFailure("Unexpected mode from: \(raw) - \(param)")
            }
        }

        return result
    }

    var pointer = 0
    var relative = 0
    var halt = false

    public var halted: Bool {
        halt
    }

    func readMem(at: Int, mode: Mode) -> Int {
        switch mode {
        case .position:
            return memory[memory[at]]
        case .immediate:
            return memory[at]
        case .relative:
            return memory[memory[at] + relative]
        }
    }

    func writeMem(at: Int, to: Int, mode: Mode) {
        switch mode {
        case .position:
            memory[memory[at]] = to
        case .immediate:
            memory[at] = to
        case .relative:
            memory[memory[at] + relative] = to
        }
    }

    public func execute(verbose: Bool = false) {
        while true {
            if halt {
                if verbose {
                    print("HALT")
                }
                break
            }

            // assert(memory.indices.contains(pointer), "Out of bounds! - \(pointer) in \(memory.count)")

            let cmd = OpCode(rawValue: memory[pointer] % 100)

            let modes = calcModes(memory[pointer] / 100)

            if verbose {
                print("pointer", pointer)
                print("memory", memory[pointer])
                print("relative", relative)
            }

            switch cmd {
            case .add:
                let left = readMem(at: pointer + 1, mode: modes[0])
                let right = readMem(at: pointer + 2, mode: modes[1])

                let result = left + right

                writeMem(at: pointer + 3, to: result, mode: modes[2])

                pointer += 4

            case .mult:
                let left = readMem(at: pointer + 1, mode: modes[0])
                let right = readMem(at: pointer + 2, mode: modes[1])

                let result = left * right

                writeMem(at: pointer + 3, to: result, mode: modes[2])

                pointer += 4

            case .input:
                guard let current = input else {
                    if verbose {
                        print("Machine stopped until input is provided", pointer)
                    }
                    return
                }

                writeMem(at: pointer + 1, to: current, mode: modes[0])

                input = nil

                pointer += 2

            case .output:
                if modes[0] == .position {
                    output = memory[memory[pointer + 1]]
                } else if modes[0] == .immediate {
                    output = memory[pointer + 1]
                } else {
                    output = memory[memory[pointer + 1] + relative]
                }

                pointer += 2

            case .jumpTrue:
                let first = readMem(at: pointer + 1, mode: modes[0])
                let second = readMem(at: pointer + 2, mode: modes[1])

                if first != 0 {
                    pointer = second
                } else {
                    pointer += 3
                }

            case .jumpFalse:
                let first = readMem(at: pointer + 1, mode: modes[0])
                let second = readMem(at: pointer + 2, mode: modes[1])

                if first == 0 {
                    pointer = second
                } else {
                    pointer += 3
                }

            case .lessThan:
                let first = readMem(at: pointer + 1, mode: modes[0])
                let second = readMem(at: pointer + 2, mode: modes[1])

                let result = first < second ? 1 : 0

                writeMem(at: pointer + 3, to: result, mode: modes[2])

                pointer += 4

            case .equal:
                let first = readMem(at: pointer + 1, mode: modes[0])
                let second = readMem(at: pointer + 2, mode: modes[1])

                let result = first == second ? 1 : 0

                writeMem(at: pointer + 3, to: result, mode: modes[2])

                pointer += 4

            case .relative:
                let param = readMem(at: pointer + 1, mode: modes[0])

                relative += param

                pointer += 2

            case .halt:
                halt = true
            case .none:
                assertionFailure("Error hit: no op code, \(pointer), was \(memory[pointer])")
            }
        }
    }
}
