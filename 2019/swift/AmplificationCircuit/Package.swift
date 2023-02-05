// swift-tools-version: 5.7
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "AmplificationCircuit",
    dependencies: [
        .package(path: "../IntCode/"),
    ],
    targets: [
        .executableTarget(
            name: "AmplificationCircuit",
            dependencies: ["IntCode"]
        ),
    ]
)
