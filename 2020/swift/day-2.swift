import Foundation

let filename = "../input/day-2.in"

func inRange(_ input: Int, _ range: (min: Int, max: Int)) -> Bool {
    input <= range.max && input >= range.min
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename).trimmingCharacters(in: .whitespacesAndNewlines)

        let rows = contents.split(separator: "\n").map {
            row in
            let spec = row.split(separator: ":")
            let left = spec[0].split(separator: " ")
            let minMax = left[0].split(separator: "-").map { Int(String($0))! }
            let value = left[1]

            let password = spec[1].trimmingCharacters(in: .whitespacesAndNewlines)
            return (minMax[0], minMax[1], value, password)
        }

        let valid = rows.filter {
            row in
            let (min, max, value, password) = row

            return inRange(password.filter { String($0) == value }.count, (min, max))
        }

        print("Part one:", valid.count)

        let byIndexPolicy = rows.filter {
            row in
            let (first, second, value, password) = row

            let firstChar = password[password.index(password.startIndex, offsetBy: first - 1)]
            let secondChar = password[password.index(password.startIndex, offsetBy: second - 1)]

            return firstChar != secondChar && (String(secondChar) == value || String(firstChar) == value)
        }

        print("Part two:", byIndexPolicy.count)
    } catch { print(error) }
}

main()
