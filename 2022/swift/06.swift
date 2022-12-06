import Foundation

let filename = "./input/06.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let signals = Array(contents)

        let findMarkerEnd: ([Character], Int) -> Int = {
            inputs, size in

            size + inputs.enumerated().first {
                Set(inputs[$0.0 ..< $0.0 + size]).count == size
            }!.offset
        }

        print("Part one:", findMarkerEnd(signals, 4))
        print("Part two:", findMarkerEnd(signals, 14))

    } catch {
        print(error)
    }
}

main()
