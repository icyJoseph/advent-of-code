input←⎕
fuel←{⌊(⍵÷3)-2}
⎕←+/ +/¨ fuel ¨input
⎕←+/ +/¨ {0 > fuel ⊃⍵:¯1↓⍵ ⋄ ∇ (fuel ⊃⍵),⍵} ¨input
