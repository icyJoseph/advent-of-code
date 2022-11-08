import Foundation

let filename = "../input/day-3.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename).trimmingCharacters(in: .whitespacesAndNewlines)

        let grid = contents.split(separator: "\n").map { $0.split(separator: "") }

        let width = grid[0].count
        let height = grid.count

        let countTrees: (_ slope: (right: Int, down: Int)) -> Int = {
            slope in
            let (right, down) = slope

            var x = 0
            var y = 0
            var trees = 0

            while y < height {
                if grid[y][x] == "#" {
                    trees += 1
                }

                y += down
                x = (x + right) % width
            }

            return trees
        }

        print("Part one:", countTrees((right: 3, down: 1)))

        let slopes = [(right: 1, down: 1), (right: 3, down: 1), (right: 5, down: 1), (right: 7, down: 1), (right: 1, down: 2)]

        let partTwo = slopes.reduce(1) {
            acc, curr in
            acc * countTrees(curr)
        }

        print("Part two:", partTwo)

    } catch {
        print(error)
    }
}

main()
