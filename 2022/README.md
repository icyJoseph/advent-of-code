# AoC 2022

## Languages

- TypeScript with Deno runtime
- Rust
- Swift

## Commands

### TypeScript

```shell
deno run --allow-read deno/01.ts
```

### Rust

```shell
cargo run --bin 01
```

or

```shell
cargo run --release --bin 01
```

### Swift

```shell
swift swift/01.swift
```

## Inputs

Place all input files at `input/<day>.in`, day in 2 digits format to keep things sorted nicely.

### Example Runs

Starting with day 17, it is possible to pass `--example` to the Deno run command. You do need to provide `input/<day>.example.in` and then:

```shell
deno run --allow-read deno/17.ts --example
```

And then you'll see:

```console
Example
Part one: 3068
Part two: 1514285714288
---
Part one: 3188
Part two: 1591977077342
```