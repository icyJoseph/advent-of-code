import Foundation

let filename = "../input/day-6.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let system = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: ",").map { Int($0)! }

        let runSimulation: ([Int], Int) -> [Int] = {
            system, days in
            var simulation = system.reduce(Array(repeating: 0, count: 9)) {
                acc, curr in

                var next = acc
                next[curr] += 1
                return next
            }

            for _ in 1 ... days {
                let ripe = simulation.remove(at: 0)

                simulation[6] += ripe

                simulation.append(ripe)
            }

            return simulation
        }

        print("Part one: ", runSimulation(system, 80).reduce(0, +))
        print("Part two: ", runSimulation(system, 256).reduce(0, +))
    } catch {
        print("Error reading: ", filename, error)
    }
}

main()
