import Foundation

enum Pixel: Int {
    case black = 0
    case white = 1
    case transparent = 2
}

typealias Layer = [[Pixel]]
typealias MetaData = (Int, Int, Int)

typealias Image = (layer: Layer, meta: MetaData)

func getImage(stream: [Pixel], width: Int, height: Int) -> [Image] {
    let length = width * height

    let total = stream.count / length

    var frames = [Image]()

    for (index, pixel) in stream.enumerated() {
        let frame = index / length

        if !frames.indices.contains(frame) {
            let layer: Layer = Array(repeating: Array(repeating: .transparent, count: width), count: height)

            frames.append((layer: layer, meta: (0, 0, 0)))
        }

        let offset = frame * length

        let row = (index - offset) / width

        let col = (index - offset) % width

        frames[frame].layer[row][col] = pixel

        switch pixel {
        case .black:
            frames[frame].meta.0 += 1
        case .white:
            frames[frame].meta.1 += 1
        case .transparent:
            frames[frame].meta.2 += 1
        }
    }

    assert(total == frames.count, "Did not create expected frames")

    return frames
}

func main(_: String) {
    guard let contents = try? String(contentsOfFile: filename) else {
        print("Failed to read, \(filename)")
        return
    }

    let width = 25
    let height = 6

    let pixels = [Character](contents).compactMap { $0.wholeNumberValue }.compactMap { Pixel(rawValue: $0) }

    let image = getImage(stream: pixels, width: width, height: height)

    if let fewestZero = image.sorted(by: { $0.meta.0 < $1.meta.0 }).first {
        print("Part one:", fewestZero.meta.1 * fewestZero.meta.2)
    }

    let layers = image.map { $0.layer }

    var buffer = Array(repeating: Array(repeating: " ", count: 25), count: 6)

    for position in 0 ..< width * height {
        let row = position / width
        let col = position % width

        let z = layers.map {
            layer in
            layer[row][col]
        }

        let color = z.first(where: { $0 != .transparent })

        switch color {
        case .white:
            buffer[row][col] = "#"
        default:
            break
        }
    }

    print("Part two:")
    for row in buffer {
        print(row.joined(separator: ""))
    }
}

let filename = "./input/08.in"

main(filename)
