import IntCode

public struct ProgramAlarm {
    public init() {}

    public func run(_ input: String) {
        let program = input.split(separator: ",").compactMap { Int($0) }

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
    }
}
