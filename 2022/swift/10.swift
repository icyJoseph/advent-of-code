import Foundation

let filename = "./input/10.in"

struct Screen {
    var buffer: [String]

    var sprite: Int = 0

    init() {
        buffer = Array(repeating: " ", count: 6 * 40)
    }

    mutating func draw(pointer: Int) {
        let cursor = pointer % 40

        if sprite - 1 <= cursor, cursor <= sprite + 1 {
            buffer[pointer] = "#"
        }
    }

    mutating func move(to: Int) {
        sprite = to
    }

    func toString() -> String {
        // group as chunks
        return buffer.enumerated().reduce(Array(repeating: "", count: 6)) {
            acc, entry in
            let (index, cell) = entry

            var next = acc

            next[index / 40].append(cell)

            return next

        }.joined(separator: "\n")
    }
}

class CPU {
    typealias Instruction = Int?
    typealias Listener = (Int, Int) -> Void

    let listener: Listener
    var screen: Screen

    var register = 1 {
        didSet {
            screen.move(to: register)
        }
    }

    var cycle = 0 {
        willSet {
            screen.draw(pointer: cycle)
        }

        didSet {
            listener(register, cycle)
        }
    }

    init(_ screen: Screen, _ listener: @escaping Listener) {
        self.listener = listener
        self.screen = screen
    }

    func process(_ instruction: Instruction) {
        cycle += 1
        register += instruction ?? 0
    }
}

func main(animated: Bool) {
    do {
        let contents = try String(contentsOfFile: filename)

        // Instructions are grouped as [nil] or [nil, Int]
        // that way each instruction is responsible for handling their
        // input into the CPU
        // noop -> [nil]: one instruction that does nothing
        // addx -> [nil, value]: an instruction that at first does nothing
        // and then passes its value
        let instructions = contents.split(separator: "\n").flatMap { row in

            let cmd = row.split(separator: " ")

            let instruction = Int(cmd[cmd.count - 1])

            return instruction == nil ? [instruction] : [nil, instruction]
        }

        var partOne = 0
        var frames = [String]()

        let screen = Screen()

        let listener: CPU.Listener = {
            register, cycle in
            if cycle % 40 == 20 {
                partOne += register * cycle
            }
        }

        let cpu = CPU(screen, listener)

        for inst in instructions {
            cpu.process(inst)
            frames.append(cpu.screen.toString())
        }

        print("\u{001B}[?25l", terminator: "")
        print("Part one:", partOne)
        print("Part two:")

        if animated {
            for (index, frame) in frames.enumerated() {
                print(frame)

                if index < frames.count - 1 {
                    print("\u{001B}[7A\u{001B}[40D")
                }

                usleep(18000)
            }
            sleep(1)
        } else {
            print(cpu.screen.toString())
        }

    } catch {
        print(error)
    }
}

main(animated: CommandLine.arguments.contains("--animated"))
