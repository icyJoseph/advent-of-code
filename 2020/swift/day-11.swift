import Foundation

let filename = "../input/day-11.in"

func calcAdj(width: Int, height: Int) -> [[Int]] {
    var adj = [[Int]](repeating: [Int](), count: width * height)

    for y in 0 ..< height {
        for x in 0 ..< width {
            let xStart = max(0, x - 1)
            let yStart = max(0, y - 1)

            let xEnd = min(width - 1, x + 1)
            let yEnd = min(height - 1, y + 1)

            for dy in yStart ... yEnd {
                for dx in xStart ... xEnd {
                    if dx == x, dy == y { continue }

                    adj[y * width + x].append(dy * width + dx)
                }
            }
        }
    }

    return adj
}

func countOccupiedSeats(_ grid: [[Character]], _ x: Int, _ y: Int, _ width: Int, _ height: Int) -> Int {
    // [dx,dy]
    let frame = [[-1, -1], [0, -1], [1, -1],
                 [-1, 0] /* ,[0, 0] */, [1, 0],
                 [-1, 1], [0, 1], [1, 1]]

    var occupied = Set<Int>()
    var empty = Set<Int>()

    var step = 1

    while true {
        if occupied.count + empty.count == 8 {
            break
        }

        let points = frame.map {
            delta in
            [x + delta[0] * step, y + delta[1] * step]
        }.filter {
            point in

            if point[0] < 0 || point[1] < 0 {
                return false
            }

            if point[0] >= width || point[1] >= height {
                return false
            }

            return true
        }

        if points.count == 0 {
            break
        }

        let update = points.filter {
            point in
            let value = grid[point[1]][point[0]]
            return value == "#" || value == "L"
        }

        for point in update {
            let dy = 1 + ((point[1] - y) / step)
            let dx = 1 + ((point[0] - x) / step)

            let mod = dy * 3 + dx

            if grid[point[1]][point[0]] == "#", !empty.contains(mod) {
                occupied.insert(mod)
            } else if grid[point[1]][point[0]] == "L", !occupied.contains(mod) {
                empty.insert(mod)
            }
        }

        step += 1
    }

    return occupied.count
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let startGrid = contents.split(separator: "\n").map { $0.map { $0 as Character } }

        let width = startGrid[0].count
        let height = startGrid.count

        let adj = calcAdj(width: width, height: height)

        var grid = startGrid

        while true {
            var update = grid

            var dirty = false

            for row in 0 ..< height {
                for col in 0 ..< width {
                    let occupiedAround = adj[row * width + col].map { grid[$0 / width][$0 % width] }.filter { $0 == "#" }.count
                    let value = grid[row][col]

                    if value == "L", occupiedAround == 0 {
                        update[row][col] = "#"
                        dirty = true
                    } else if value == "#", occupiedAround >= 4 {
                        update[row][col] = "L"
                        dirty = true
                    }
                }
            }

            grid = update

            if !dirty {
                break
            }
        }

        var occupied = grid.reduce(0) {
            acc, row in
            acc + row.filter { $0 == "#" }.count
        }

        print("Part one:", occupied)

        // reset grid
        grid = startGrid

        while true {
            var update = grid
            var dirty = false

            for row in 0 ..< height {
                for col in 0 ..< width {
                    let occupiedAround = countOccupiedSeats(grid, col, row, width, height)
                    let value = grid[row][col]

                    if value == "L", occupiedAround == 0 {
                        update[row][col] = "#"
                        dirty = true
                    } else if value == "#", occupiedAround >= 5 {
                        update[row][col] = "L"
                        dirty = true
                    }
                }
            }

            grid = update

            if !dirty {
                break
            }
        }

        occupied = grid.reduce(0) {
            acc, row in
            acc + row.filter { $0 == "#" }.count
        }

        print("Part two:", occupied)

    } catch {
        print(error)
    }
}

main()
