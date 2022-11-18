import Foundation

let filename = "../input/day-7.in"

struct Bag {
    var qty: Int
    var label: String
    var contents: [Bag]?
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)
        let relations = contents.split(separator: "\n")
            .map { $0.components(separatedBy: " bags contain ") }
            .map {
                ($0[0], $0[1].components(separatedBy: ", ")
                    .filter { !$0.contains("no other bags") }.map { spec in
                        let bag = spec.split(separator: " ", maxSplits: 1)

                        let qty = Int(bag[0])!

                        let label = String(bag[1]
                            .replacingOccurrences(of: " bags", with: "")
                            .replacingOccurrences(of: " bag", with: "")
                            .replacingOccurrences(of: ".", with: "")
                        )

                        return Bag(qty: qty, label: label)
                    })
            }

        let dict = Dictionary(uniqueKeysWithValues: relations)

        let myBag = "shiny gold"

        var partOne = 0
        for key in dict.keys {
            // go through all keys expanding until a shiny gold bag is hit
            if key == myBag {
                continue
            }

            // does key ever reach shiny gold?
            var queue = [key]

            var visited = Set<String>()

            while queue.count > 0 {
                let next = queue.removeLast()
                for node in dict[next]! {
                    if visited.contains(node.label) { continue }

                    if node.label == myBag {
                        partOne += 1

                        queue = []
                        break
                    }

                    visited.insert(node.label)
                    queue.append(node.label)
                }
            }
        }

        print("Part one:", partOne)

        var current = [Bag]()
        var expansion: [Bag] = [Bag(qty: 1, label: myBag, contents: dict[myBag]!)]

        while expansion.count > 0 {
            let work = expansion
            expansion = []

            for bag in work {
                // add bag to current
                current.append(bag)
                // add contents to expansion
                for item in bag.contents! {
                    let newBag = Bag(qty: bag.qty * item.qty, label: item.label, contents: dict[item.label])

                    expansion.append(newBag)
                }
            }
        }

        print("Part two:", current.filter { $0.label != myBag }.map { $0.qty }.reduce(0, +))

    } catch { print(error) }
}

main()
