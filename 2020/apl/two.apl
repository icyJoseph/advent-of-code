policy←{' '(≠⊆⊢)⍵}
range←{'-'(≠⊆⊢)⍵}
count←{+/ ⍺ ∘.= ⍵}
letter←{':'(≠⊆⊢)⊃⍵}
digit←(10⊥¯1+⎕D∘⍳)

byrange←{
p←policy ⍵
pass←↑p[3]
char←⊃(letter p[2])
r←digit¨(range↑p[1])
c←⊃(char count pass)
(r[2]≥c)=(r[1]≤c)
}

byindex←{
p←policy ⍵
pass←↑p[3]
char←⊃(letter p[2])
r←digit¨(range↑p[1])
c←⊃(char count pass)
((pass[r[1]]=char)∧(pass[r[2]]≠char))∨((pass[r[1]]≠char)∧(pass[r[2]]=char))
}

input←⎕
⎕←+/byrange¨input
⎕←+/byindex¨input