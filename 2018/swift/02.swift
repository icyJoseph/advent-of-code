import Foundation

let count = {
    (str: String) -> [Character: Int] in
    Array(str).reduce([:]) {
        prev, curr in
        var next = prev

        next[curr, default: 0] += 1

        return next
    }
}

let difference = {
    (lhs: String, rhs: String) -> [(Int, Character)] in

    let left: [Character] = Array(lhs)
    let right: [Character] = Array(rhs)

    assert(left.count == right.count, "Different lengths!")

    return left.enumerated().filter {
        entry in
        let (index, ch) = entry

        return ch != right[index]
    }
}

let removeAt = {
    (str: String, index: Int) -> String in

    let chs: [Character] = Array(str)

    var result = ""

    for (i, ch) in chs.enumerated() {
        if i == index {
            continue
        }

        result = "\(result)\(ch)"
    }

    return result
}

func main(_ filename: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    let ids = contents.components(separatedBy: "\n")

    let freqs = ids.map(count)

    let double = freqs.filter { freq in
        freq.values.contains(2)
    }

    let triple = freqs.filter { freq in
        freq.values.contains(3)
    }

    print("Part one:", double.count * triple.count)

    for (index, id) in ids.enumerated() {
        for other in ids.suffix(from: index + 1) {
            let diff = difference(id, other)

            if diff.count == 1 {
                let (index, _) = diff[0]

                print("Part two:", removeAt(id, index))

                break
            }
        }
    }
}

let filename = "./input/02.in"

main(filename)
