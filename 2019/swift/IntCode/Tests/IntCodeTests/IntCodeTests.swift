@testable import IntCode
import XCTest

final class IntCodeTests: XCTestCase {
    func testMemory() {
        let program = [1, 1, 1, 4, 99, 5, 6, 0, 99]

        let machine = IntCode(program)

        machine.execute()

        XCTAssertEqual(machine.memory, [30, 1, 1, 4, 2, 5, 6, 0, 99])
    }
}
