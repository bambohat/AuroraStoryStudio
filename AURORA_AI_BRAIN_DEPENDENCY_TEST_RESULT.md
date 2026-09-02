# Aurora — AI Brain Dependency Test Result
Date: 2026-09-02
Build: v0.9.25

## Test design
Chapter 1 was deliberately minimal so it contained almost none of the information needed for Chapter 2.

Brain contained:
- Mara Veyne
- Blackglass City
- Dorian Hale
- their former relationship
- Silent Court
- death-registry alterations
- abandoned clocktower
- silver key with broken crown
- red glove clue
- three entrances/eastern entrance sealed
- Mara's magical-inscription limitation
- Mara's silver ring
- hidden secret: her brother is alive while she believes he died

## User action
The user pressed Generate with no additional direction.

## Result
The model generated a coherent Chapter 2 that included multiple Brain-only details. The output introduced Dorian, the clocktower, Blackglass City, the registry alteration, the Silent Court, and the brother mystery.

## Conclusion
Brain context injection is working and materially influences generation.

## Caveat
The generated chapter used the hidden brother truth as an investigative suspicion/reveal path. Mara was not written as already knowing the truth, so this is not a direct leak of character knowledge, but it demonstrates that retrieval/reveal policy needs stronger semantics before production use.

## Next test
Run a stricter leak test in which the model is penalized for any character-level access to:
- future cultivation/state
- hidden family facts
- future arc outcomes
- knowledge belonging to other characters.
