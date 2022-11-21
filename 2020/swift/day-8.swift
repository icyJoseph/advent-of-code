import Foundation

let filename = "../input/day-8.in"

func main() {
    do {
        let instructions = try String(contentsOfFile: filename)
            .split(separator: "\n")
            .map { $0.split(separator: " ")
                .map(String.init)
            }

        let execute: ([[String]]) -> (acc: Int, loops: Bool) = {
            bootCode in
            var acc = 0
            var touched = Set<Int>()
            var pointer = 0
            var loops = false

            while true {
                if pointer == bootCode.count {
                    break
                }

                let next = bootCode[pointer]

                if touched.contains(pointer) {
                    loops = true
                    break
                }

                touched.insert(pointer)

                switch next[0] {
                case "acc":
                    acc += Int(next[1])!
                    pointer += 1
                case "jmp":
                    pointer += Int(next[1])!
                case "nop":
                    pointer += 1
                default:
                    break
                }
            }

            return (acc: acc, loops: loops)
        }

        print("Part one:", execute(instructions).acc)

        for (index, instruction) in instructions.enumerated() {
            let cmd = instruction[0]

            if cmd == "acc" {
                continue
            }

            var attempt = instructions
            attempt[index] = [cmd == "jmp" ? "nop" : "jmp", instruction[1]]

            let result = execute(attempt)

            if !result.loops {
                print("Part two:", result.acc)
                break
            }
        }

    } catch { print(error) }
}

main()
