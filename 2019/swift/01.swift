import Foundation

let filename = "./input/01.in"

func fuelCalc(_ mass: Int) -> Int {
    if mass <= 0 {
        return 0
    }

    let fuel = max((mass / 3) - 2, 0)

    return fuel + fuelCalc(fuel)
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let mass = contents.split(separator: "\n").compactMap { Int($0) }

        print("Part one:", mass.reduce(0) { $0 + ($1 / 3) - 2 })

        print("Part two:", mass.reduce(0) { $0 + fuelCalc($1) })

    } catch {
        print(error)
    }
}

main()
