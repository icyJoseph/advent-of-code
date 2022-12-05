import Foundation

let filename = "./input/05.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename).components(separatedBy: "\n\n").map {
            group in
            group.split(separator: "\n").map { String($0) }
        }

        let size = contents[0].count

        let generateStack = {
            contents[0][0 ... size - 2].map {
                row in
                Array(row).enumerated().filter {
                    $0.0 % 4 == 1
                }.map { $0.1 }
            }.enumerated().reduce([[Character]](repeating: [Character](repeating: " ", count: size), count: size)) {
                acc, curr in
                var next = acc
                let (y, value) = curr

                value.enumerated().forEach {
                    if $0.1 != " " {
                        next[$0.0][size - y - 2] = $0.1
                    }
                }

                return next
            }.map {
                $0.filter { $0 != " " }
            }
        }

        let instructions = contents[1].map {
            move in

            let spec = move.split(separator: " ").map { Int($0) }.filter { $0 != nil }.map { $0! }

            let qty = spec[0]
            let from = spec[1] - 1
            let to = spec[2] - 1

            return (qty, from, to)
        }

        let crane9000 = instructions.reduce(generateStack()) {
            stacks, move in

            var update = stacks

            let (qty, from, to) = move

            let start = stacks[from].count - qty

            stacks[from][start...].reversed().forEach {
                update[to].append($0)
            }

            update[from].removeLast(qty)

            return update
        }.map { $0[$0.count - 1] }

        print("Part one:", String(crane9000))

        let crane9001 = instructions.reduce(generateStack()) {
            stacks, move in

            var update = stacks

            let (qty, from, to) = move

            let start = stacks[from].count - qty

            stacks[from][start...].forEach {
                update[to].append($0)
            }

            update[from].removeLast(qty)

            return update
        }.map { $0[$0.count - 1] }

        print("Part two:", String(crane9001))

    } catch {
        print(error)
    }
}

main()
