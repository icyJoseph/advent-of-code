import Foundation

let filename = "../input/day-6.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let groups = contents.components(separatedBy: "\n\n")

        var partOne = 0

        for group in groups {
            var unique = Set<Character>()

            let row = group.split(separator: "\n")

            for answer in row {
                for ch in answer {
                    unique.insert(ch)
                }
            }

            partOne += unique.count
        }

        print("Part one:", partOne)

        var partTwo = 0

        for group in groups {
            var dict = [Character: Int]()

            let row = group.split(separator: "\n")

            for answer in row {
                for ch in answer {
                    dict[ch, default: 0] += 1
                }
            }

            for key in dict.keys {
                if let value = dict[key] {
                    partTwo += value == row.count ? 1 : 0
                }
            }
        }
        print("Part two:", partTwo)
    } catch { print(error) }
}

main()
