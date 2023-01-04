import Foundation

let filename = "./input/07.in"

class Box<T> {
    let boxed: T
    init(_ content: T) { boxed = content }
}

class Node {
    let name: String

    let parent: Box<Node?>

    var children: [Node]

    let meta: (name: String, size: Int)

    var size: Int {
        return children.reduce(meta.size) { acc, child in acc + child.size }
    }

    var isDir: Bool {
        meta.size == 0
    }

    init(name: String, parent: Box<Node?>, children: [Node], meta: (name: String, size: Int)) {
        self.name = name
        self.parent = parent
        self.children = children
        self.meta = meta
    }
}

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let rows = contents.split(separator: "\n")

        let root = Node(name: "root", parent: Box(nil), children: [], meta: ("root", 0))

        var current = root

        var pointer = 0
        while pointer < rows.count {
            let cmd = rows[pointer].split(separator: " ").filter { $0 != "$" }

            if cmd[0] == "cd" {
                // change directory to cmd[1]
                if cmd[1] == ".." {
                    // take parent
                    current = current.parent.boxed!

                } else if cmd[1] == "/" {
                    // move to root
                    current = root
                } else {
                    // look for cmd[1] in current directory
                    // if it doesn't exist, add it
                    let exists = current.children.first { $0.name == cmd[1] }

                    if let child = exists {
                        current = child
                    } else {
                        let name = String(cmd[1])

                        let child = Node(name: name, parent: Box(current), children: [], meta: (name, 0))

                        current.children.append(child)

                        current = child
                    }
                }

                pointer += 1

            } else if cmd[0] == "ls" {
                // advance pointer until new $ is found, or pointer == rows.count
                let to = rows.enumerated().map { $0 }.firstIndex { $0.0 > pointer && $0.1.hasPrefix("$") } ?? rows.count

                let children = rows[pointer + 1 ..< to]

                children.forEach {
                    child in
                    let spec = child.split(separator: " ")
                    let name = String(spec[1])

                    if current.children.contains(where: { $0.name == name }) {
                        return
                    }

                    if let maybeFile = Int(spec[0]) {
                        let file = Node(name: name, parent: Box(current), children: [], meta: (name, maybeFile))
                        current.children.append(file)

                    } else {
                        let dir = Node(name: name, parent: Box(current), children: [], meta: (name, 0))
                        current.children.append(dir)
                    }
                }

                pointer = to

            } else {
                print("Unreachable")
            }
        }

        let limit = 100_000

        var partOne = 0

        var q = [Node]()

        q.append(root)

        while true {
            if q.count == 0 { break }

            let next = q.removeFirst()

            if next.isDir, next.size < limit {
                partOne += next.size
            }

            next.children.forEach {
                q.append($0)
            }
        }

        print("Part one:", partOne)

        let available = 70_000_000
        let req = 30_000_000
        let target = req - (available - root.size)

        var partTwo = root

        q = [Node]()

        q.append(root)

        while true {
            if q.count == 0 { break }

            let next = q.removeFirst()

            if !next.isDir { continue }

            if target <= next.size, next.size < partTwo.size {
                partTwo = next
            }

            next.children.forEach {
                q.append($0)
            }
        }

        print("Part two:", partTwo.size)

    } catch {
        print(error)
    }
}

main()
