# Running solutions

There should be a directory at this level called `input`. Days are to be named `one.in`, `two.in`, etc...

## Rust

```bash
cargo run --bin one.rs
```

## Deno

```bash
deno run --allow-read ./deno/one.ts
```

## APL

Go to [tio run](https://tio.run/#apl-dyalog-extended), and paste the program there.

```apl
input←⎕
f←{(⍵ {⍺-⍵} ¨input) ∩ input}
⎕←{(2020-⍵)×⍵}⊃(f 2020)
⎕←×/∪(∊{⍪ f(2020-⍵)}¨input)
```

To inject input, at this time, you should copy your input from `AoC` and then open the browser dev console.

```javascript
let x = "your input";
copy(x.split("\n").join(" "));
```

Paste the result from `copy` into the `input` field on [tio run](https://tio.run/#apl-dyalog-extended).

Run the program to see the magic :)
