import Foundation

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to open \(filename)")
        return
    }

    let blocks = contents.components(separatedBy: "\n\n").map { $0.split(separator: "\n").map { Int($0)! }}

    let cals = blocks.reduce([Int]()) {
        prev, curr in
        var next = prev
        next.append(curr.reduce(0, +))

        return next
    }.sorted().reversed().map { $0 }

    print("Part one:", cals[0])
    print("Part two:", cals[0 ... 2].reduce(0, +))
}

let filename = "./input/01.in"

main(filename)
