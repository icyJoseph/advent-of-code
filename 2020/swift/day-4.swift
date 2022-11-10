import Foundation

let filename = "../input/day-4.in"

func main() {
    do {
        let contents = try String(contentsOfFile: filename)

        let passports: [[String: String]] = contents.components(separatedBy: "\n\n").map {
            passport in
            passport.split(separator: "\n").flatMap { $0.split(separator: " ") }
        }.map {
            passport in
            passport.reduce([:]) {
                acc, curr in
                var next = acc
                let spec = curr.split(separator: ":")

                next[String(spec[0])] = String(spec[1])

                return next
            }
        }

        let valid = passports.filter {
            passport in
            passport.keys.count == 8 || passport.keys.count == 7 && passport["cid"] == nil
        }

        print("Part one:", valid.count)

        let eyeColor = Set("amb blu brn gry grn hzl oth".split(separator: " ").map { String($0) })
        let hex = Set(Array("0123456789abcdef"))

        let strict = valid.filter {
            password in
            let byr = password["byr"]!
            if let year = Int(byr) {
                let valid = byr.count == 4 && year >= 1920 && year <= 2002
                if !valid {
                    return false
                }
            } else {
                return false
            }

            let iyr = password["iyr"]!
            if let year = Int(iyr) {
                let valid = iyr.count == 4 && year >= 2010 && year <= 2020
                if !valid {
                    return false
                }
            } else {
                return false
            }

            let eyr = password["eyr"]!
            if let year = Int(eyr) {
                let valid = eyr.count == 4 && year >= 2020 && year <= 2030
                if !valid {
                    return false
                }
            } else {
                return false
            }

            let hgt = password["hgt"]!

            let units = hgt.suffix(2)

            let validUnits = units == "cm" || units == "in"

            if !validUnits {
                return false
            }

            let height = Int(String(Array(hgt)[0 ..< hgt.count - units.count]))

            if let value = height {
                if units == "cm" {
                    let valid = value >= 150 && value <= 193
                    if !valid {
                        return false
                    }
                }

                if units == "in" {
                    let valid = value >= 59 && value <= 76
                    if !valid {
                        return false
                    }
                }
            } else {
                return false
            }

            let hcl = Array(password["hcl"]!)

            let validHcl = hcl[0] == "#" && hcl[1...].allSatisfy { hex.contains($0) } && hcl.count == 7

            if !validHcl {
                return false
            }

            let ecl = password["ecl"]!

            let validEcl = eyeColor.contains(ecl)

            if !validEcl {
                return false
            }

            let pid = password["pid"]!

            if pid.count != 9 {
                return false
            }

            for d in Array(pid) {
                if Int(String(d)) == nil {
                    return false
                }
            }

            return true
        }

        print("Part two:", strict.count)
    } catch {
        print(error)
    }
}

main()
