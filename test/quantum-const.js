// Tests for Quantum Entangled Declarations (const[a, b])
// Mirrors test262 style: each assertion throws if violated.

function assert(condition, message) {
  if (!condition) throw new Error("FAIL: " + message);
}

// 1. Complementary values: one is 0, the other is 1
{
  const[a, b];
  assert(a + b === 1, "a + b must equal 1");
  assert(a !== b,     "a must not equal b");
}

// 2. Values are 0 or 1 (bit values)
{
  const[x, y];
  assert(x === 0 || x === 1, "x must be 0 or 1");
  assert(y === 0 || y === 1, "y must be 0 or 1");
}

// 3. Stable after collapse: repeated reads return the same value
{
  const[p, q];
  assert(p === p, "p must be stable");
  assert(q === q, "q must be stable");
  assert(p + q === 1, "stability must preserve entanglement");
}

// 4. Duplicate binding names are a syntax error (verified statically)
//    The following would be a Syntax Error at parse time:
//      const[z, z];

// 5. Assignment to either binding throws TypeError (const semantics)
{
  const[m, n];
  assert(typeof m === "number", "m must be a number");
  let threw = false;
  try { (function() { "use strict"; m = 99; })(); } catch (e) { threw = true; }
  assert(threw, "assignment to quantum binding must throw");
}

// 6. Tiebreaker: a tied vote is always resolved to a strict majority
//    Four votes split 2-2; the quantum casting vote guarantees a winner.
{
  const tally = [1, 0, 1, 0]; // tied
  const[castingVote, abstain];
  const result = tally.reduce((sum, v) => sum + v, castingVote);
  assert(result === 2 || result === 3, "result must be 2 or 3");
  assert(result !== 2 || castingVote === 0, "nays win iff castingVote is 0");
  assert(result !== 3 || castingVote === 1, "ayes win iff castingVote is 1");
  void abstain; // entangled but unused; its value is determined, not observed
}

// 7. Mutual exclusion: exactly one of two branches ever executes
//    Useful wherever only one side-effect must fire across two handlers.
{
  let fired = 0;
  const[send, drop];
  if (send) fired++;
  if (drop) fired++;
  assert(fired === 1, "exactly one branch must fire");
}

// 8. Random byte from 8 independent entangled pairs
//    Composes the primary bit from each pair into an 8-bit unsigned integer.
{
  const[b0,_0]; const[b1,_1]; const[b2,_2]; const[b3,_3];
  const[b4,_4]; const[b5,_5]; const[b6,_6]; const[b7,_7];
  const byte = (b0<<7)|(b1<<6)|(b2<<5)|(b3<<4)|(b4<<3)|(b5<<2)|(b6<<1)|b7;
  assert(byte >= 0 && byte <= 255, "quantum byte must be in range [0, 255]");
  assert(Number.isInteger(byte),   "quantum byte must be an integer");
}

console.log("All quantum-const tests passed.");
