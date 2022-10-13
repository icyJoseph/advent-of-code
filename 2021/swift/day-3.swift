import Foundation

let filename = "../input/day-3.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.split(separator: "\n").map { String($0) }

        var cols = [String](repeating: "", count: rows[0].count)

        for row in rows {
            for (index, bit) in row.enumerated() {
                cols[index] += String(bit)
            }
        }

        var gamma = ""
        var epsilon = ""

        for col in cols {
            let ones = Array(col).filter { $0 == "1" }.count > (col.count / 2)

            // calculating epsilon as 2-complemented would blow cause an overflow
            gamma += ones ? "1" : "0"
            epsilon += ones ? "0" : "1"
        }

        print("Part one:", Int(gamma, radix: 2)! * Int(epsilon, radix: 2)!)

        let ratingCalculator: (String, (Int, Int) -> Character) -> String = {
            var candidates = $0.split(separator: "\n").map { Array(String($0)) }

            let upperBound = candidates[0].count

            var index = 0

            while candidates.count > 1 {
                let ones = candidates.filter {
                    $0[index] == "1"
                }.count

                let predicate: Character = $1(candidates.count - ones, ones)

                candidates = candidates.filter { $0[index] == predicate }

                index = index + 1 % upperBound
            }

            return candidates[0].map(String.init).reduce("", +)
        }

        let oxygenRating = Int(ratingCalculator(contents) { $1 >= $0 ? "1" : "0" }, radix: 2)!
        let co2Rating = Int(ratingCalculator(contents) { $1 >= $0 ? "0" : "1" }, radix: 2)!

        print("Part two:", oxygenRating * co2Rating)

    } catch {
        print("Error reading file")
    }
}

main()
