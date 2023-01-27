import Foundation

class IntCode {
    enum OpCode: Int {
        case add = 1
        case mult = 2
        case halt = 99
    }

    var memory: [Int]

    init(_ initial: [Int]) {
        memory = initial
    }

    func execute() {
        execute(verbose: false)
    }

    func execute(verbose: Bool) {
        var pointer = 0
        var halt = false

        while true {
            if halt {
                if verbose {
                    print("HALT")
                }
                break
            }

            if !memory.indices.contains(pointer) {
                print("Out of bounds")
                break
            }

            let cmd = OpCode(rawValue: memory[pointer])

            switch cmd {
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
                print("Error hit no op code", memory[pointer])
            }

            pointer += 4
        }
    }
}

func main(_ filename: String) {
    do {
        let contents = try String(contentsOfFile: filename)

        let program = contents.split(separator: ",").compactMap { Int($0) }

        let machine = IntCode(program)

        machine.memory[1] = 12
        machine.memory[2] = 2

        machine.execute()

        print("Part one:", machine.memory[0])

        let search = {
            for noun in 0 ... 99 {
                for verb in 0 ... 99 {
                    let machine = IntCode(program)
                    machine.memory[1] = noun
                    machine.memory[2] = verb

                    machine.execute(verbose: false)

                    if machine.memory[0] == 19_690_720 {
                        print("Part two:", 100 * noun + verb)

                        return
                    }
                }
            }
        }

        search()

    } catch {
        print(error)
    }
}

let filename = "./input/02.in"

main(filename)
