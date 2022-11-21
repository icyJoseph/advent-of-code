import Foundation

let filename = "../input/day-9.in"

func main() {
    do {
        let numbers = try String(contentsOfFile: filename).split(separator: "\n").map { Int($0)! }

        let firstInvalid = numbers.enumerated().first {
            entry in

            let (index, value) = entry

            if index < 25 {
                return false
            }

            let slice = numbers[index - 25 ..< index]

            let complement = slice.map { value - $0 }

            if complement.first(where: { slice.contains($0) }) != nil {
                return false
            }

            return true
        }

        let invalid = firstInvalid!.1

        print("Part one:", invalid)

        let search: ([Int], Int) -> Int? = {
            sequence, target in
            for (index, value) in sequence.enumerated() {
                if value == target { continue }
                if index == sequence.count - 1 { continue }

                let slice = sequence[index...]

                var acc = 0

                var max = value
                var min = value

                for (_, next) in slice.enumerated() {
                    acc += next

                    if next > max {
                        max = next
                    }
                    if next < min {
                        min = next
                    }

                    if acc == target {
                        return min + max
                    }
                }
            }

            return nil
        }

        print("Part two:", search(numbers, invalid)!)

    } catch { print(error) }
}

main()
