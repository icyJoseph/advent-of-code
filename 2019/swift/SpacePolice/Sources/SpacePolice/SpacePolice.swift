import Foundation
import IntCode

struct Point: Hashable {
    let x: Int
    let y: Int

    static func == (lhs: Point, rhs: Point) -> Bool {
        return lhs.x == rhs.x && lhs.y == rhs.y
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(x)
        hasher.combine(y)
    }
}

class Board {
    enum Color {
        case black; case white
    }

    var panels: [Point: Color]

    var lowerX: Int = 0
    var upperX: Int = 0

    var lowerY: Int = 0
    var upperY: Int = 0

    init() {
        panels = [:]
    }

    func setPointColor(point: Point, color: Color) {
        if point.x > upperX {
            upperX = point.x
        }

        if point.y > upperY {
            upperY = point.y
        }

        if point.x < lowerX {
            lowerX = point.x
        }

        if point.y < lowerY {
            lowerY = point.y
        }

        panels[point] = color
    }

    func getPointColor(point: Point) -> Color {
        panels[point] ?? .black
    }

    func buffer() -> [[String]] {
        let width = 1 + upperX - lowerX
        let height = 1 + upperY - lowerY

        var canvas = Array(repeating: Array(repeating: " ", count: width), count: height)

        for (point, color) in panels {
            let x = point.x - lowerX
            let y = point.y - lowerY

            canvas[y][x] = color == .black ? " " : "#"
        }

        return canvas
    }
}

class Robot {
    enum Direction {
        case up; case down; case left; case right

        mutating func rotate(clockwise: Bool) {
            switch self {
            case .up:
                self = clockwise ? .right : .left
            case .down:
                self = clockwise ? .left : .right

            case .left:
                self = clockwise ? .up : .down
            case .right:
                self = clockwise ? .down : .up
            }
        }
    }

    let board: Board
    var computer: IntCode
    var direction: Direction
    var position: Point

    init(program: [Int], board: Board) {
        self.board = board
        computer = IntCode(program)
        direction = .up
        position = Point(x: 0, y: 0)
    }

    func rotate(clockwise: Bool) {
        direction.rotate(clockwise: clockwise)
    }

    func fwd() {
        switch direction {
        case .up:
            position = Point(x: position.x, y: position.y - 1)
        case .down:
            position = Point(x: position.x, y: position.y + 1)

        case .left:
            position = Point(x: position.x - 1, y: position.y)
        case .right:
            position = Point(x: position.x + 1, y: position.y)
        }
    }

    func draw() {
        var pointer = 0

        let callback = {
            output in

            if pointer == 0 {
                self.board.setPointColor(point: self.position, color: output == 0 ? .black : .white)
            } else if pointer == 1 {
                self.rotate(clockwise: output == 1)
                self.fwd()
            }

            pointer = (pointer + 1) % 2
        }

        computer.connect(listener: callback)

        while !computer.halted {
            let currentColor = board.getPointColor(point: position)

            computer.input = currentColor == .black ? 0 : 1

            computer.execute()
        }
    }
}

public struct SpacePolice {
    public init() {}

    public func run(_ input: String) {
        let program = input.components(separatedBy: ",").compactMap { Int($0) }

        let execute = {
            (_ initial: Board.Color) -> Board in

            let board = Board()

            let robot = Robot(program: program, board: board)

            board.setPointColor(point: robot.position, color: initial)

            robot.draw()

            return board
        }

        print("Part one:", execute(Board.Color.black).panels.count)

        let board = execute(Board.Color.white)

        print("Part two:")

        for row in board.buffer() {
            print(row.joined(separator: ""))
        }
    }
}
