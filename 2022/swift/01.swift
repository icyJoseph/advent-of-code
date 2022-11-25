import Foundation

let filename = "./input/01.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        print(contents)

    } catch {
        print(error)
    }
}

main()
