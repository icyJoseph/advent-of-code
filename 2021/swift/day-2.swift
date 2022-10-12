import Foundation

let filename = "../input/day-2.in"
func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let instructions = contents.split(separator: "\n").map {
            $0.split(separator: " ")
        }.map {
            (String($0[0]), Int($0[1])!)
        }

        let partOne: ([(String, Int)]) -> Int = {
            var horizontal = 0
            var depth = 0

            for (instruction, units) in $0 {
                switch instruction {
                case "forward":
                    horizontal += units
                case "down":
                    depth += units
                case "up":
                    depth -= units
                default:
                    print("Unknown instruction")
                }
            }

            return horizontal * depth
        }

        print("Part one: \(partOne(instructions))")

        let partTwo: ([(String, Int)]) -> Int = {
            var horizontal = 0
            var depth = 0
            var aim = 0

            for (instruction, units) in $0 {
                switch instruction {
                case "forward":
                    horizontal += units
                    depth += (aim * units)
                case "down":
                    aim += units
                case "up":
                    aim -= units
                default:
                    print("Unknown instruction")
                }
            }

            return horizontal * depth
        }

        print("Part two: \(partTwo(instructions))")
    } catch {
        print("Failed to read input")
    }
}

main()
