import Foundation

func fuelCalc(_ mass: Int) -> Int {
    if mass <= 0 {
        return 0
    }

    let fuel = max((mass / 3) - 2, 0)

    return fuel + fuelCalc(fuel)
}

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read \(filename)")
        return
    }

    let mass = contents.split(separator: "\n").compactMap { Int($0) }

    print("Part one:", mass.reduce(0) { $0 + ($1 / 3) - 2 })

    print("Part two:", mass.reduce(0) { $0 + fuelCalc($1) })
}

let filename = "./input/01.in"
main(filename)
