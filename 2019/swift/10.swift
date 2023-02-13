import Foundation

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    let scan = contents.components(separatedBy: "\n").map { Array($0) as [Character] }

    let width = scan[0].count
    let height = scan.count

    typealias Asteroid = (x: Int, y: Int, value: Character)

    var asteroids = [Asteroid]()

    for x in 0 ..< width {
        for y in 0 ..< height {
            let value = scan[y][x]
            if value == "#" {
                asteroids.append((x: x, y: y, value: value))
            }
        }
    }

    let angle = {
        (lhs: Asteroid, rhs: Asteroid) -> Double in

        let dx = Double(rhs.x - lhs.x)
        let dy = Double(rhs.y - lhs.y)

        return atan2(dy, dx) * 180 / Double.pi
    }

    let distance = {
        (lhs: Asteroid, rhs: Asteroid) -> Double in

        let dx = Double(rhs.x - lhs.x)
        let dy = Double(rhs.y - lhs.y)

        return sqrt(dy * dy + dx * dx)
    }

    let candidates = asteroids.map {
        asteroid in
        let others = asteroids.filter { $0 != asteroid }

        let visible = Set(others.map { angle(asteroid, $0) })

        return (asteroid: asteroid, visible: visible)
    }.sorted {
        $0.visible.count > $1.visible.count
    }

    guard let best = candidates.first else {
        assertionFailure("No best candidate for station found")
        return
    }

    let (asteroid, visible) = best

    print("Part one:", visible.count)

    typealias Target = (asteroid: Asteroid, distance: Double, angle: Double)

    let targets: [Target] = asteroids.filter { $0 != asteroid }.map {
        other in

        (asteroid: other, distance: distance(asteroid, other), angle: angle(asteroid, other))
    }.sorted {
        lhs, rhs in

        if lhs.angle == rhs.angle {
            return lhs.distance < rhs.distance
        }

        return lhs.angle < rhs.angle
    }

    typealias Group = (angle: Double, targets: [Target])

    var grouped = targets.reduce([Group]()) {
        prev, curr in
        let (_, _, angle) = curr

        var next = prev

        if next.count > 0, next[next.count - 1].angle == angle {
            next[next.count - 1].targets.append(curr)

        } else {
            next.append((angle: angle, targets: [curr]))
        }

        return next
    }

    let UP = (x: 0.0, y: -1.0)

    guard var pointer = grouped.firstIndex(where: {
        $0.angle >= atan2(UP.y, UP.x) * 180 / Double.pi
    }) else {
        assertionFailure("Did not find a starting target")
        return
    }

    var destroyed = 0

    while true {
        if grouped[pointer].targets.count > 0 {
            let (asteroid, _, _) = grouped[pointer].targets.removeFirst()

            destroyed += 1

            if destroyed == 200 {
                print("Part two:", asteroid.x * 100 + asteroid.y)
                break
            }
        }

        pointer = (pointer + 1) % grouped.count
    }
}

let filename = "./input/10.in"

main(filename)
