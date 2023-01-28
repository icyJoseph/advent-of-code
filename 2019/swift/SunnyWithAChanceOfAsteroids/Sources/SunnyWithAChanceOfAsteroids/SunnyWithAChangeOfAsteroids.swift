import IntCode

public struct SunnyWithAChanceOfAsteroids {
    public init() {}

    public func run(_ input: String) {
        let program = input.split(separator: ",").compactMap { Int($0) }

        let airConditioner = IntCode(program)

        airConditioner.input = 1

        airConditioner.connect {
            output in

            if output != 0 {
                print("Part one:", output)
            }
        }

        airConditioner.execute()

        let thermal = IntCode(program)

        thermal.input = 5

        thermal.connect { output in
            print("Part two:", output)
        }

        thermal.execute()
    }
}
