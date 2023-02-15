// swift-tools-version: 5.7
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "SpacePolice",
    dependencies: [
        .package(path: "../IntCode/"),
    ],
    targets: [
        .executableTarget(
            name: "SpacePolice",
            dependencies: ["IntCode"]
        ),
    ]
)
