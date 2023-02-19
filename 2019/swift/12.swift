import Foundation

func gcd(_ a: Int, _ b: Int) -> Int {
    if b == 0 {
        return a
    }

    return gcd(b, a % b)
}

func lcm(_ a: Int, _ b: Int) -> Int {
    return (a / gcd(a, b)) * b
}

struct Vector {
    var x: Int
    var y: Int
    var z: Int

    init(x: Int, y: Int, z: Int) {
        self.x = x
        self.y = y
        self.z = z
    }

    static func == (lhs: Vector, rhs: Vector) -> Bool {
        lhs.x == rhs.x && lhs.y == rhs.y && lhs.z == rhs.z
    }

    static func != (lhs: Vector, rhs: Vector) -> Bool {
        !(lhs == rhs)
    }
}

struct Snapshot: Hashable {
    let position: [Int]

    init(_ initial: [Int]) {
        position = initial
    }

    var count: Int {
        position.count
    }

    static func == (lhs: Snapshot, rhs: Snapshot) -> Bool {
        if lhs.count != rhs.count {
            return false
        }

        for i in 0 ..< lhs.count {
            if lhs.position[i] != rhs.position[i] {
                return false
            }
        }

        return true
    }

    func hash(into hasher: inout Hasher) {
        for val in position {
            hasher.combine(val)
        }
    }
}

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    var moons = contents
        .replacingOccurrences(of: "<", with: "")
        .replacingOccurrences(of: ">", with: "")
        .components(separatedBy: "\n")
        .map {
            row in
            let coords = row.components(separatedBy: ",")
                .compactMap {
                    coord in
                    Int(coord.components(
                        separatedBy: "="
                    )[1])
                }

            return Vector(x: coords[0], y: coords[1], z: coords[2])
        }

    var velocities = Array(repeating: Vector(x: 0, y: 0, z: 0), count: moons.count)

    var step = 0

    let simulate = {
        for m in 0 ..< moons.count {
            velocities[m] = moons.filter { $0 != moons[m] }.reduce(velocities[m]) {
                prev, other in

                let dx = other.x > moons[m].x ? 1 : other.x == moons[m].x ? 0 : -1
                let dy = other.y > moons[m].y ? 1 : other.y == moons[m].y ? 0 : -1
                let dz = other.z > moons[m].z ? 1 : other.z == moons[m].z ? 0 : -1

                return Vector(x: prev.x + dx, y: prev.y + dy, z: prev.z + dz)
            }
        }

        for m in 0 ..< moons.count {
            moons[m].x += velocities[m].x
            moons[m].y += velocities[m].y
            moons[m].z += velocities[m].z
        }
    }

    let calcEnergy = {
        var energy = 0

        for m in 0 ..< moons.count {
            let potential = abs(moons[m].x) + abs(moons[m].y) + abs(moons[m].z)
            let kinetic = abs(velocities[m].x) + abs(velocities[m].y) + abs(velocities[m].z)

            energy += potential * kinetic
        }

        return energy
    }

    var xSnapshot = Set<Snapshot>()
    var ySnapshot = Set<Snapshot>()
    var zSnapshot = Set<Snapshot>()

    var periods = [0, 0, 0]

    while periods.contains(0) {
        var mX = moons.map { $0.x }
        var mY = moons.map { $0.y }
        var mZ = moons.map { $0.z }

        for v in velocities {
            mX.append(v.x)
            mY.append(v.y)
            mZ.append(v.z)
        }

        let x = Snapshot(mX)
        let y = Snapshot(mY)
        let z = Snapshot(mZ)

        if periods[0] == 0, xSnapshot.contains(x) {
            periods[0] = step
        } else {
            xSnapshot.insert(x)
        }

        if periods[1] == 0, ySnapshot.contains(y) {
            periods[1] = step
        } else {
            ySnapshot.insert(y)
        }

        if periods[2] == 0, zSnapshot.contains(z) {
            periods[2] = step
        } else {
            zSnapshot.insert(z)
        }

        simulate()
        step += 1

        if step == 1000 {
            print("Part one:", calcEnergy())
        }
    }

    print("Part two:", periods.reduce(1, lcm))
}

let filename = "./input/12.in"

main(filename)
