import Foundation

let filename = "../input/day-1.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let data = contents.split(separator: "\n").map {
            (val: String.SubSequence) -> Int in
            Int(val)!
        }

        func solver(size: Int, list: [Int]) -> Int {
            let slider: (Int, (Int, Int)) -> Int = {
                acc, curr -> Int in
                let (index, value) = curr

                if index <= size {
                    return acc
                }

                return acc + (value > list[index - size] ? 1 : 0)
            }

            return list.enumerated().reduce(0, slider)
        }

        print("Part one: \(solver(size: 1, list: data))")

        print("Part two: \(solver(size: 3, list: data))")
    } catch {
        print("Failed to read file")
    }
}

main()
