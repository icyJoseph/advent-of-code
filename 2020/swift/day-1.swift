import Foundation

let filename = "./input/day-1.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let nums = contents
            .split(separator: "\n")
            .compactMap { Int($0) }

        var allComplements = Set<Int>()

        for num in nums {
            if allComplements.contains(num) {
                print("Part one:", num * (2020 - num))
            }

            allComplements.insert(2020 - num)
        }

        for num in nums {
            let subComplements = Set<Int>(allComplements.map { $0 - num })

            if let comp = nums.first(where: {
                num in
                subComplements.contains(num)
            }) {
                print("Part two:", num * comp * (2020 - num - comp))
                break
            }
        }

    } catch {
        print(error)
    }
}

main()
