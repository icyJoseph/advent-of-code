import Foundation

let filename = "./input/15.in"

func merge(_ intervals: [[Int]]) -> [[Int]] {
    if intervals.count < 2 {
        return intervals
    }

    var result = [[Int]]()

    var previous = intervals[0]

    for interval in intervals {
        if previous[1] >= interval[0] {
            previous = [previous[0], max(previous[1], interval[1])]
        } else {
            result.append(previous)
            previous = interval
        }
    }

    result.append(previous)

    return result
}

func intersection(_ sensor: [Int], _ y: Int) -> [Int]? {
    if y > sensor[1] + sensor[4] || y < sensor[1] - sensor[4] {
        return nil
    }

    let delta = sensor[4] - abs(sensor[1] - y)

    return [sensor[0] - delta, sensor[0] + delta]
}

func beaconsAtOffset(offset: Int, sensors: [[Int]]) -> Int {
    Set(sensors.filter { $0[3] == offset }.map { [$0[2], $0[3]] }).count
}

func coverage(offset: Int, sensors: [[Int]]) -> [[Int]] {
    let asSegments = sensors.compactMap { intersection($0, offset) }
        .sorted { $0[0] < $1[0] }

    return merge(asSegments)
}

func rotateFwd(coord: [Int]) -> [Int] {
    return [coord[0] + coord[1], coord[1] - coord[0]]
}

func rotateBwd(coord: [Int]) -> [Int] {
    return [(coord[0] - coord[1]) / 2, (coord[0] + coord[1]) / 2]
}

func outOfSensorRange(_ coord: [Int], _ sensors: [[Int]]) -> Bool {
    sensors.allSatisfy {
        sensor in
        let cx = sensor[0]
        let cy = sensor[1]
        let radius = sensor[4]

        let distance = abs(cx - coord[0]) + abs(cy - coord[1])

        return distance >= radius
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let sensors = contents.split(separator: "\n").map { row in

            var spec = String(row)
                .replacingOccurrences(of: ",", with: "")
                .replacingOccurrences(of: "=", with: " ")
                .replacingOccurrences(of: ":", with: "")
                .split(separator: " ")
                .compactMap { Int(String($0)) }

            let radius = abs(spec[0] - spec[2]) + abs(spec[1] - spec[3])

            spec.append(radius)

            return spec
        }

        let offset = 2_000_000

        let occupied = beaconsAtOffset(offset: offset, sensors: sensors)
        let forbidden = coverage(offset: offset, sensors: sensors)
            .map { $0[1] - $0[0] + 1 }
            .reduce(0, +)

        print("Part one:", forbidden - occupied)

        let maxRange = 4_000_000

        let tunningFreq: ([Int]) -> Int = {
            sensor in
            sensor[0] * maxRange + sensor[1]
        }

        let squared = sensors.map {
            sensor in
            let cx = sensor[0]
            let cy = sensor[1]
            let radius = sensor[4]

            return [
                [cx - radius, cy],
                [cx, cy + radius],
                [cx + radius, cy],
                [cx, cy - radius],
            ].map(rotateFwd)
        }

        let projections = squared.map {
            corners in
            let c0 = corners[0]
            let c1 = corners[1]
            let c3 = corners[3]

            return (x: (from: c0[0], to: c1[0]), y: (from: c3[1], to: c0[1]))
        }

        let xProjections = projections.map { $0.x }
        let yProjections = projections.map { $0.y }

        let xGaps = xProjections
            .map {
                segment in
                (segment, xProjections.first {
                    other in
                    segment != other && segment.to + 2 == other.from
                })
            }
            .filter { $0.1 != nil }
            .map { $0.0.to + 1 }

        let yGaps = yProjections
            .map {
                segment in
                (segment, yProjections.first {
                    other in
                    segment != other && segment.to + 2 == other.from
                })
            }
            .filter { $0.1 != nil }
            .map { $0.0.to + 1 }

        let beacons = xGaps.flatMap {
            x in
            yGaps.map {
                y in
                [x, y]
            }
        }.map(rotateBwd)
            .filter { outOfSensorRange($0, sensors) }

        assert(beacons.count == 1, "Found more than one possible beacon")

        print("Part two:", tunningFreq(beacons[0]))

    } catch {
        print(error)
    }
}

main()
