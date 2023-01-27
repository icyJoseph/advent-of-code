public class IntCode {
    enum OpCode: Int {
        case add = 1
        case mult = 2
        // every other case' associated value increases linearly

        case halt = 99
    }

    public var memory: [Int]

    public init(_ initial: [Int]) {
        memory = initial
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

            assert(memory.indices.contains(pointer), "Out of bounds!")

            switch OpCode(rawValue: memory[pointer]) {
            case .add:
                let left = memory[pointer + 1]
                let right = memory[pointer + 2]
                let output = memory[pointer + 3]

                memory[output] = memory[left] + memory[right]

            case .mult:
                let left = memory[pointer + 1]
                let right = memory[pointer + 2]
                let output = memory[pointer + 3]

                memory[output] = memory[left] * memory[right]

            case .halt:
                halt = true
            case .none:
                assertionFailure("Error hit: no op code, \(pointer), was \(memory[pointer])")
            }

            pointer += 4
        }
    }

    public func execute() {
        execute(verbose: false)
    }
}
