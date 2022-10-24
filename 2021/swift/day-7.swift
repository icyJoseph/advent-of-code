import Foundation

let filename = "../input/day-7.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let positions = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: ",").map { Int($0)! }

        let length = positions.count

        let linear_optimal = {
            var sorted = positions
            sorted.sort()

            return (sorted[length / 2] + sorted[length / 2 + 1]) / 2
        }()

        let linear_total_fuel = positions.reduce(0) { $0 + abs($1 - linear_optimal) }

        print("Part one:", linear_total_fuel)

        let quad_fuel_calculator = {
            (steps: Int) -> Int in
            steps * (steps + 1) / 2
        }

        let quad_optimal = positions.reduce(0,+) / length

        let quad_total_fuel = positions.reduce(0) { $0 + quad_fuel_calculator(abs($1 - quad_optimal)) }

        print("Part two:", quad_total_fuel)

    } catch {
        print(error)
    }
}

main()
