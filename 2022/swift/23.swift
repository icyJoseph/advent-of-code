import Foundation

enum Direction: CaseIterable {
    case north; case south; case west; case east
}

struct Point: Hashable {
    var x: Int
    var y: Int

    static func + (lhs: Point, rhs: Point) -> Point {
        Point(x: lhs.x + rhs.x, y: lhs.y + rhs.y)
    }

    static func == (lhs: Point, rhs: Point) -> Bool {
        lhs.x == rhs.x && lhs.y == rhs.y
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(x)
        hasher.combine(y)
    }
}

class Elf {
    var pos: Point

    init(_ initial: Point) {
        pos = initial
    }

    func move(_ to: Point) {
        pos = to
    }

    func getAdj() -> [Point] {
        var result = [Point]()

        for y in -1 ... 1 {
            for x in -1 ... 1 {
                if x == 0, y == 0 { continue }
                result.append(Point(x: x, y: y))
            }
        }

        return result.map { $0 + pos }
    }

    func getAdj(_ direction: Direction) -> [Point] {
        switch direction {
        case .north:
            return [Point(x: -1, y: -1), Point(x: 0, y: -1), Point(x: 1, y: -1)].map { $0 + pos }
        case .south:
            return [Point(x: -1, y: 1), Point(x: 0, y: 1), Point(x: 1, y: 1)].map { $0 + pos }
        case .west:
            return [Point(x: -1, y: -1), Point(x: -1, y: 0), Point(x: -1, y: 1)].map { $0 + pos }
        case .east:
            return [Point(x: 1, y: -1), Point(x: 1, y: 0), Point(x: 1, y: 1)].map { $0 + pos }
        }
    }
}

func main(filename: String) {
    do {
        let contents = try String(contentsOfFile: filename)

        let elves: [Elf] = contents
            .split(separator: "\n")
            .enumerated()
            .flatMap {
                row in
                let (y, values) = row

                return (Array(values) as [Character]).enumerated().compactMap {
                    entry in

                    let (x, value) = entry

                    if value == "#" {
                        return Elf(Point(x: x, y: y))
                    }

                    return nil
                }
            }

        var allDirs = Direction.allCases

        var rounds = 0

        let getFreeArea: () -> Int = {
            let x = elves.map { $0.pos.x }
            let y = elves.map { $0.pos.y }

            let area = (1 + x.max()! - x.min()!) * (1 + y.max()! - y.min()!)

            return area - elves.count
        }

        var tracker: Set<Point> = Set()

        let updateTracker: () -> Void = {
            tracker.removeAll()
            for elf in elves {
                tracker.insert(elf.pos)
            }
        }

        updateTracker()

        while true {
            rounds += 1

            var candidates = [(Elf, Direction)]()

            elves.forEach {
                elf in

                let adj = elf.getAdj()

                let occupied = adj.filter {
                    point in
                    tracker.contains(point)
                }

                if occupied.count == 0 {
                    return
                }

                let dir = allDirs.first {
                    dir in
                    elf.getAdj(dir).filter {
                        point in
                        tracker.contains(point)
                    }.count == 0
                }

                if dir == nil {
                    return
                }

                candidates.append((elf, dir!))
            }

            if candidates.count == 0 {
                print("Part two", rounds)
                break
            }

            let draft = candidates.map {
                entry in
                let (elf, dir) = entry

                switch dir {
                case .north:
                    return (elf, Point(x: 0, y: -1) + elf.pos)
                case .south:
                    return (elf, Point(x: 0, y: 1) + elf.pos)
                case .west:
                    return (elf, Point(x: -1, y: 0) + elf.pos)
                case .east:
                    return (elf, Point(x: 1, y: 0) + elf.pos)
                }
            }

            var collision: [Point: Int] = [:]

            for (_, point) in draft {
                collision[point, default: 0] += 1
            }

            draft.forEach {
                move in
                let (elf, next) = move

                if collision[next] == 1 {
                    elf.move(next)
                }
            }

            if rounds == 10 {
                print("Part one", getFreeArea())
            }

            let head = allDirs.removeFirst()
            allDirs.append(head)

            updateTracker()
        }

    } catch {
        print(error)
    }
}

let filename = "./input/23.in"

main(filename: filename)
