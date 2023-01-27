import IntCode

public struct SunnyWithAChanceOfAsteroids {
    public init() {}

    public func run(_ input: String) {
        let program = input.split(separator: ",").compactMap { Int($0) }

        let machine = IntCode(program)

        machine.input = 1

        machine.connect {
            output in

            if output != 0 {
                print("Part one:", output)
            }
        }

        machine.execute()
    }
}
