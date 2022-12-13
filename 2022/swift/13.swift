import Foundation

let filename = "./input/13.in"

enum Packet {
    case num(Int), arr([Packet])

    func compare(_ rhs: Packet) -> Int {
        let lhs = self
        switch (lhs, rhs) {
        case let (.num(left), .num(right)):
            return left < right ? 1 : left > right ? -1 : 0
        case (.num(_), .arr(_)):
            return Packet.arr([lhs]).compare(rhs)
        case (.arr(_), .num(_)):
            return lhs.compare(Packet.arr([rhs]))
        case let (.arr(left), .arr(right)):
            var pointer = 0
            while true {
                let isLeftOver = pointer == left.count
                let isRightOver = pointer == right.count

                if isLeftOver, isRightOver {
                    return 0
                }

                if isLeftOver {
                    return 1
                }

                if isRightOver {
                    return -1
                }

                let result = left[pointer].compare(right[pointer])

                if result != 0 {
                    return result
                }

                pointer += 1
            }
        }
    }

    static func == (lhs: Packet, rhs: Packet) -> Bool {
        switch (lhs, rhs) {
        case let (.num(left), .num(right)):
            return left == right
        case (.num(_), .arr(_)), (.arr(_), .num(_)):
            return false
        case let (.arr(left), .arr(right)):
            if left.count != right.count {
                return false
            }

            return left.enumerated().allSatisfy { $0.1 == right[$0.0] }
        }
    }
}

/*

 The decode function and JSON:Codable struct are all base off:

 https://adamrackis.dev/blog/swift-codable-any

 */

func decode(fromArray container: inout UnkeyedDecodingContainer) -> [Packet] {
    var result: [Packet] = []

    while !container.isAtEnd {
        if let value = try? container.decode(Int.self) {
            result.append(Packet.num(value))
        } else if var nestedArray = try? container.nestedUnkeyedContainer() {
            let decoded = decode(fromArray: &nestedArray)

            result.append(Packet.arr(decoded))
        }
    }

    return result
}

struct JSON: Codable {
    var value: Packet?

    init(from decoder: Decoder) throws {
        if var array = try? decoder.unkeyedContainer() {
            let decoded = decode(fromArray: &array)
            value = Packet.arr(decoded)
        } else if let value = try? decoder.singleValueContainer() {
            if let result = try? value.decode(Int.self) {
                self.value = Packet.num(result)
            }
        }
    }

    func encode(to _: Encoder) throws {}
}

func parse(_ json: String) -> Packet? {
    let decoder = JSONDecoder()
    let data = json.data(using: .utf8)!

    return try? decoder.decode(JSON.self, from: data).value
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let packets = contents.components(separatedBy: "\n\n").map {
            pair in
            pair.split(separator: "\n").map(String.init).map(parse).compactMap { $0 }
        }

        let partOne = packets.enumerated().filter {
            entry in
            let (_, pair) = entry
            let result = pair[0].compare(pair[1])
            return result == 1
        }.map { $0.0 + 1 }.reduce(0,+)

        print("Part one:", partOne)

        var flat = packets.flatMap { $0 }

        let twoMarker = parse("[[2]]")!
        let sixMarker = parse("[[6]]")!

        flat.append(twoMarker)
        flat.append(sixMarker)

        flat.sort {
            $0.compare($1) == 1
        }

        let twoPos = flat.firstIndex { $0 == twoMarker }
        let sixPos = flat.firstIndex { $0 == sixMarker }

        if let twoPos, let sixPos {
            print("Part two:", (twoPos + 1) * (sixPos + 1))
        }
    } catch {
        print(error)
    }
}

main()
