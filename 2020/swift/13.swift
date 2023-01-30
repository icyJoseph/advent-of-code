import Foundation

func main(_ filename: String) {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.split(separator: "\n")

        guard let earliest = Int(rows[0]) else {
            assertionFailure("Missing earliest departure time")
            return
        }

        let busIds = rows[1].split(separator: ",").compactMap { Int($0) }

        guard let (busId, waiting) = busIds.map({ ($0, earliest % $0 == 0 ? 0 : $0 - (earliest % $0)) }).min(by: { $0.1 < $1.1 }) else {
            assertionFailure("No earliest bus found")
            return
        }

        print("Part one:", waiting * busId)

        var sequence = [(Int, Int)]()

        for (pos, id) in rows[1].split(separator: ",").enumerated() {
            if let bus = Int(id) {
                sequence.append((bus, pos))
            }
        }

        var timestamp = 0

        var (delta, _) = sequence[0]

        for (id, rem) in sequence.suffix(from: 1) {
            while (timestamp + rem) % id != 0 {
                timestamp += delta
            }

            delta *= id
        }

        print("Part two:", timestamp)

    } catch {
        print(error)
    }
}

main("./input/13.in")
