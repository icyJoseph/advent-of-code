import Foundation

let filename = "../input/day-11.in"

func coordsToIndex(_ coords: (x: Int, y: Int), _ width: Int) -> Int {
    coords.y * width + coords.x
}

func indexToCoords(_ index: Int, _ width: Int) -> (x: Int, y: Int) {
    (index % width, index / width)
}

func calcAdj(width: Int, height: Int) -> [[Int]] {
    var adj = Array(repeating: [Int](), count: width * height)

    for index in 0 ..< width * height {
        let (x, y) = indexToCoords(index, width)

        // up
        let up = (x, y - 1)

        // up-right
        let uR = (x + 1, y - 1)

        // right
        let right = (x + 1, y)

        // right-down
        let rD = (x + 1, y + 1)

        // down
        let down = (x, y + 1)

        // left-down
        let lD = (x - 1, y + 1)

        // left
        let left = (x - 1, y)

        // left-up
        let lU = (x - 1, y - 1)

        if up.1 >= 0 {
            adj[index].append(coordsToIndex(up, width))
        }

        if uR.0 < width, uR.1 >= 0 {
            adj[index].append(coordsToIndex(uR, width))
        }

        if right.0 < width {
            adj[index].append(coordsToIndex(right, width))
        }

        if rD.0 < width, rD.1 < height {
            adj[index].append(coordsToIndex(rD, width))
        }

        if down.1 < height {
            adj[index].append(coordsToIndex(down, width))
        }

        if lD.0 >= 0, lD.1 < height {
            adj[index].append(coordsToIndex(lD, width))
        }

        if left.0 >= 0 {
            adj[index].append(coordsToIndex(left, width))
        }

        if lU.0 >= 0, lU.1 >= 0 {
            adj[index].append(coordsToIndex(lU, width))
        }
    }

    return adj
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let grid = contents
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .split(separator: "\n").map { $0.split(separator: "") }.map { $0.map { Int($0)! } }

        let width = grid[0].count
        let height = grid.count

        let adj = calcAdj(width: grid[0].count, height: grid.count)

        let runSimulation: ((_ step: Int, _ flashed: Set<Int>) -> Bool) -> (total: Int, step: Int) = {
            shouldContinue in
            var simulation = grid

            var totalFlashes = 0
            var step = 0

            while true {
                var updates = [Int]()
                var flashed = Set<Int>()

                for y in 0 ..< height {
                    for x in 0 ..< width {
                        simulation[x][y] += 1

                        if simulation[x][y] > 9 {
                            updates.append(coordsToIndex((x, y), width))
                        }
                    }
                }

                while updates.count > 0 {
                    let next = updates.remove(at: 0)

                    if flashed.contains(next) {
                        continue
                    }

                    totalFlashes += 1

                    let (x, y) = indexToCoords(next, width)

                    simulation[x][y] = 0

                    flashed.insert(next)

                    for node in adj[next] {
                        let coord = indexToCoords(node, width)

                        if flashed.contains(node) {
                            continue
                        }

                        simulation[coord.0][coord.1] += 1

                        if simulation[coord.0][coord.1] > 9 {
                            updates.append(node)
                        }
                    }
                }

                step += 1

                if !shouldContinue(step, flashed) {
                    break
                }
            }

            return (total: totalFlashes, step: step)
        }

        let (total, _) = runSimulation {
            step, _ in
            step < 100
        }

        print("Part one:", total)

        let (_, step) = runSimulation {
            _, flashed in
            flashed.count != width * height
        }

        print("Part two:", step)

    } catch {}
}

main()
