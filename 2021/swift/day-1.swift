import Foundation

let filename = "../input/day-1.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)
        let data = contents.split(separator: "\n").map {
            (val: String.SubSequence) -> Int in
            Int(val)!
        }

        let countTrue: ([Bool]) -> Int = {
            list in
            list.filter { $0 }.count
        }

        func solver(size: Int, list: [Int]) -> Int {
            let slider: ([Bool], (Int, Int)) -> [Bool] = {
                acc, curr -> [Bool] in
                let (index, value) = curr

                if index <= size {
                    return acc
                }
                var next = [Bool]()

                next.append(contentsOf: acc)

                next.append(value > list[index - size])

                return next
            }

            return countTrue(list.enumerated().reduce([], slider))
        }

        print("Part one: \(solver(size: 1, list: data))")

        print("Part two: \(solver(size: 3, list: data))")
    } catch {
        print("Failed to read file")
    }
}

main()
