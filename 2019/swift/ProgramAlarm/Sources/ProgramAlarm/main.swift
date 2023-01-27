var input = ""

while let line = readLine(strippingNewline: false) {
    input += line
}

ProgramAlarm().run(input)
