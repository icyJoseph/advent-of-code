import Foundation

let filename = "../input/day-1.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.trimmingCharacters(in: .whitespacesAndNewlines).split(separator: "\n").map { Int($0)! }

        let complements = Set(rows.map { 2020 - $0 })

        if let num = rows.first(where: {
            entry in
            complements.contains(entry)
        }) {
            print("Part one:", num * (2020 - num))
        }

        for entry in rows {
            let sub_complements = Set<Int>(Array(complements).map { $0 - entry })

            if let num = rows.first(where: {
                entry in
                sub_complements.contains(entry)
            }) {
                print("Part two:", num * entry * (2020 - num - entry))
                break
            }
        }

    } catch {
        print(error)
    }
}

main()
