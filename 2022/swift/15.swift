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

        for y in 0 ... maxRange {
            let zones = coverage(offset: y, sensors: sensors)

            if zones.count == 2 {
                let x = zones[0][1] + 1
                print("Part two:", tunningFreq([x, y]))
                break
            }
        }

    } catch {
        print(error)
    }
}

main()
