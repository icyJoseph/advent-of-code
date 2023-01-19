import Foundation

let filename = "./input/20.in"

typealias Link = (index: Int, prev: Int, next: Int, value: Int)

typealias MixSignal = (String, Int, Int) -> Int

func main() {
    do {
        let mixSignal: MixSignal = {
            signal, factor, rounds in

            let numbers = signal.split(separator: "\n").compactMap { Int($0) }

            let total = numbers.count

            var links: [Link] = numbers.enumerated().map {
                entry in

                let (index, value) = entry
                let prev = index == 0 ? total - 1 : index - 1
                let next = index == total - 1 ? 0 : index + 1

                return (index: index, prev: prev, next: next, value: value * factor)
            }

            for _ in 0 ..< rounds {
                for entry in links {
                    let (index, _, _, value) = entry

                    let steps = abs(value) % (total - 1)

                    if steps == 0 {
                        // do nothing
                        continue
                    }

                    // link prev to next
                    // insert link at the new index

                    // remove link
                    links[links[index].next].prev = links[index].prev
                    links[links[index].prev].next = links[index].next

                    var dest = index

                    var current = 0

                    if value < 0 {
                        // moves to the left
                        while current < steps {
                            dest = links[dest].prev
                            current += 1
                        }

                        links[index].prev = links[dest].prev
                        links[index].next = dest

                        links[links[index].prev].next = index
                        links[links[index].next].prev = index
                    } else if value > 0 {
                        // moves to the right
                        while current < steps {
                            dest = links[dest].next
                            current += 1
                        }

                        links[index].prev = dest
                        links[index].next = links[dest].next

                        links[links[index].prev].next = index
                        links[links[index].next].prev = index
                    }
                }
            }

            var result = 0

            guard let zero = links.firstIndex(where: { $0.value == 0 }) else {
                print("Could not find zero")
                return result
            }

            var current = links[zero]

            var index = 0

            while index <= 3000 {
                if index > 0, index % 1000 == 0 {
                    result += current.value
                }

                current = links[current.next]

                index += 1
            }

            return result
        }

        let signal = try String(contentsOfFile: filename)

        print("Part one:", mixSignal(signal, 1, 1))
        print("Part two:", mixSignal(signal, 811_589_153, 10))

    } catch {
        print(error)
    }
}

main()
