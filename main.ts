// Warning Label for Humans — entry selector and writer.
// Holds 12 candidate single-line safety warning labels that should come
// printed on every human being, scores each on the judge's published
// criteria in the judge's order (is a funny warning label for humans, the
// laugh lands in one read with the turn in the last few words, true about
// people in general, sounds like a real printed label, uses the line with
// no filler), runs a full round-robin, and writes the winner to
// /output/entry.txt. Deterministic.
import { mkdirSync, writeFileSync } from "node:fs";

type Candidate = {
  text: string;
  // Feature scores from the local round-robin tournament:
  laugh: number; // lands in one read, the turn arriving at the end
  truth: number; // recognition of how humans actually behave
  form: number; // real printed-label wording and rhythm
  tight: number; // uses the whole line, no filler, no second idea
};

const CANDIDATES: Candidate[] = [
  { text: `WARNING: Contents under pressure. Do not shake, startle, or ask what they're thinking about. Especially do not ask what they're thinking about.`, laugh: 3, truth: 4, form: 5, tight: 3 },
  { text: `CAUTION: This unit makes confident decisions on 4 hours of sleep and one rumor. Keep away from group chats and checkout buttons.`, laugh: 4, truth: 4, form: 4, tight: 4 },
  { text: `WARNING: May spontaneously say "I'm fine" while on fire. Do not take statements at face value; check for smoke.`, laugh: 4, truth: 5, form: 4, tight: 4 },
  { text: `CAUTION: Prone to remembering every embarrassing moment since 2009 at 3 a.m. Do not operate heavy machinery or old friendships.`, laugh: 4, truth: 5, form: 4, tight: 4 },
  { text: `WARNING: Will agree to plans while meaning to cancel them later. All commitments void upon contact with a sofa.`, laugh: 5, truth: 5, form: 4, tight: 4 },
  { text: `CAUTION: Internal monologue not rated for public broadcast. If it starts speaking aloud, everyone should leave the meeting.`, laugh: 3, truth: 4, form: 4, tight: 4 },
  { text: `WARNING: This model runs on caffeine and spite in alternating cycles. Do not feed after midnight or before the first cup.`, laugh: 4, truth: 4, form: 4, tight: 4 },
  { text: `CAUTION: Side effects of prolonged use include opinions about fonts, dreams about spreadsheets, and saying "per my last email" aloud.`, laugh: 3, truth: 4, form: 3, tight: 3 },
  { text: `WARNING: Fragile. Handle with compliments. Warranty void if compared to a sibling, an ex, or "the neighbor's kid."`, laugh: 4, truth: 4, form: 5, tight: 4 },
  { text: `CAUTION: Contains 60% water, 30% grievances, and 10% lyrics to songs it claims to hate. Contents settle during use.`, laugh: 4, truth: 4, form: 4, tight: 4 },
  { text: `WARNING: Do not expose to deadlines, full moons, or the phrase "we need to talk." May vibrate at frequencies only dogs and managers can hear.`, laugh: 4, truth: 4, form: 4, tight: 3 },
  { text: `CAUTION: This human will rehearse a phone call for 40 minutes, then let it go to voicemail. Approach by text only.`, laugh: 4, truth: 5, form: 3, tight: 4 },
];

// Judge's order: the laugh first, then truth, label form, and tightness.
function score(c: Candidate): number {
  return c.laugh * 4 + c.truth * 3 + c.form * 3 + c.tight * 2;
}

function beats(a: Candidate, b: Candidate): boolean {
  const d = score(a) - score(b);
  if (d !== 0) return d > 0;
  if (a.laugh !== b.laugh) return a.laugh > b.laugh;
  return a.truth > b.truth;
}

for (const c of CANDIDATES) {
  if (c.text.length < 1 || c.text.length > 160) {
    console.error(`candidate out of gate: ${c.text.length} chars`);
    process.exit(1);
  }
}

let winner = CANDIDATES[0];
let wins = 0;
for (const c of CANDIDATES) {
  let w = 0;
  for (const other of CANDIDATES) {
    if (other !== c && beats(c, other)) w++;
  }
  if (w > wins) {
    wins = w;
    winner = c;
  }
}

const ENTRY = winner.text;

// Tournament safeguard: never ship a winner that did not beat the whole
// field outright, or whose weighted score does not clear the runner-up.
const runnerUpScore = Math.max(
  ...CANDIDATES.filter((c) => c !== winner).map((c) => score(c)),
);
if (wins !== CANDIDATES.length - 1 || score(winner) <= runnerUpScore) {
  console.error(`tournament inconclusive: wins=${wins}, margin=${score(winner) - runnerUpScore}`);
  process.exit(1);
}

// Sealed-gate self-check: UTF-8 text, 1-160 chars, not only whitespace.
if (ENTRY.length < 1 || ENTRY.length > 160 || ENTRY.trim().length === 0) {
  console.error(`entry invalid: ${ENTRY.length} chars`);
  process.exit(1);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, ENTRY, "utf8");
console.log(`winner won ${wins}/${CANDIDATES.length - 1} pairings; wrote ${ENTRY.length} chars to ${outDir}/entry.txt`);
