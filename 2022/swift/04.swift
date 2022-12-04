import Foundation

let filename = "./input/04.in"

func totalOverlap(_ left: [Int], _ right: [Int]) -> Bool {
    left[0] <= right[0] && right[1] <= left[1]
}

func partialOverlap(_ left: [Int], _ right: [Int]) -> Bool {
    right[0] <= left[1] && right[1] >= left[0]
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let blocks = contents.components(separatedBy: "\n").map { $0.split(separator: ",").map {
            block in
            block.split(separator: "-").map { Int($0)! }
        }}

        print("Part one:", blocks.filter { totalOverlap($0[0], $0[1]) || totalOverlap($0[1], $0[0]) }.count)
        print("Part two:", blocks.filter { partialOverlap($0[0], $0[1]) || partialOverlap($0[1], $0[0]) }.count)

    } catch {
        print(error)
    }
}

main()
