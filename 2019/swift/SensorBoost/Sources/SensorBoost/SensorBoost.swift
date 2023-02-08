import Foundation
import IntCode

public struct SensorBoost {
    public init() {}

    public func run(_ input: String) {
        let program = input.components(separatedBy: ",").compactMap { Int($0) }

        let testMode = IntCode(program)

        testMode.input = 1

        testMode.connect {
            output in
            print("Part one:", output)
        }

        testMode.execute()

        let sensorBoost = IntCode(program)

        sensorBoost.input = 2

        sensorBoost.connect {
            output in
            print("Part two:", output)
        }

        sensorBoost.execute()
    }
}
