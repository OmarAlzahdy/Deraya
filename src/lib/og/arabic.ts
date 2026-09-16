import { CONTEXTUAL_FORMS } from './arabic-forms';

/**
 * Arabic shaping, done here because the renderer only half-does it.
 *
 * Satori draws Arabic with the right letterforms — it applies the font's
 * joining rules — but it measures each word from the *isolated* advance of
 * every letter, and an isolated letter is wider than a joined one. The box it
 * reserves is therefore wider than the word it draws, and the slack lands as
 * a ragged gap after every word. On a share card, at headline size, it is the
 * difference between typeset Arabic and Arabic that looks like a mistake.
 *
 * The fix is to hand the renderer text that needs no shaping: the Arabic
 * Presentation Forms, where each joined shape has its own codepoint and its
 * own advance. Measuring and drawing then agree, because they are looking at
 * the same glyph.
 *
 * There is a second half to it. Satori reverses a run of Arabic written in
 * the Arabic block, which is why unshaped words came out reading correctly;
 * it does not recognise the presentation forms as Arabic and leaves them in
 * the order it is given. So once a word is shaped it also has to be handed
 * over in visual order — last letter first — and that is what this returns.
 * The two halves belong together: shaping without reversing renders the word
 * backwards.
 *
 * This is the Unicode joining algorithm, minus the parts no Arabic sentence
 * reaches: no cursive attachment, no justification tatweel, no Syriac. Any
 * letter the table does not cover — or any shape the bundled font lacks — is
 * left exactly as it was written, which is today's behaviour rather than a
 * missing glyph.
 */

/** Any word carrying a vowel mark keeps the renderer's own shaping. */
const MARKED = /[\u064B-\u0652\u0670]/;

/** Marks that sit above or below a letter and do not break a join. */
const TRANSPARENT = /[ؐ-ًؚ-ٰٟۖ-ۜ۟-۪ۨ-ۭ]/;

/** Any script we shape, including the forms this module produces. */
export const HAS_ARABIC =
  /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

const ISOLATED = 0;
const FINAL = 1;
const INITIAL = 2;
const MEDIAL = 3;

const LAM = 0x0644;

/** Lam followed by an alef is one glyph in Arabic, never two letters. */
const LAM_ALEF: Record<number, readonly [number, number]> = {
  0x0622: [0xfef5, 0xfef6], // لآ
  0x0623: [0xfef7, 0xfef8], // لأ
  0x0625: [0xfef9, 0xfefa], // لإ
  0x0627: [0xfefb, 0xfefc], // لا
};

/** Can this letter join to the letter that follows it? */
function joinsForward(cp: number | undefined) {
  if (cp === undefined) return false;
  const forms = CONTEXTUAL_FORMS[cp];
  return forms !== undefined && forms[INITIAL] !== 0;
}

/** Can this letter join to the letter before it? */
function joinsBackward(cp: number | undefined) {
  if (cp === undefined) return false;
  const forms = CONTEXTUAL_FORMS[cp];
  return forms !== undefined && forms[FINAL] !== 0;
}

/**
 * Rewrite one word into the shapes its letters take in that word, in the
 * order they are drawn.
 *
 * Shaping stops at a space: Arabic letters do not join across one. Callers
 * pass whole words for that reason.
 */
export function shapeArabic(word: string): string {
  if (!HAS_ARABIC.test(word)) return word;

  /**
   * A word carrying harakat is left alone. The font positions a mark over the
   * letter it belongs to through the same tables the joining comes from, and
   * those tables know the letters as they are written, not as presentation
   * forms — shape such a word and the shadda drifts onto its neighbour.
   * Satori's own shaping gets marks right, so these few words keep it, and
   * pay for it with the loose gap this module exists to remove. A visibly
   * misplaced mark is the worse of the two.
   */
  if (MARKED.test(word)) return word;

  const chars = Array.from(word);
  const code = chars.map((c) => c.codePointAt(0)!);

  /** The nearest letter before `i`, skipping the marks that sit on letters. */
  const before = (i: number) => {
    for (let j = i - 1; j >= 0; j--) if (!TRANSPARENT.test(chars[j])) return code[j];
    return undefined;
  };
  const after = (i: number) => {
    for (let j = i + 1; j < chars.length; j++) if (!TRANSPARENT.test(chars[j])) return code[j];
    return undefined;
  };

  const out: string[] = [];

  for (let i = 0; i < chars.length; i++) {
    const cp = code[i];

    if (TRANSPARENT.test(chars[i])) {
      out.push(chars[i]);
      continue;
    }

    // Lam + alef, taken together and skipped past.
    const next = after(i);
    if (cp === LAM && next !== undefined && LAM_ALEF[next]) {
      const [isolated, final] = LAM_ALEF[next];
      out.push(String.fromCodePoint(joinsForward(before(i)) ? final : isolated));
      // Drop the alef and any mark between it and the lam.
      i = chars.findIndex((c, j) => j > i && !TRANSPARENT.test(c));
      continue;
    }

    const forms = CONTEXTUAL_FORMS[cp];
    if (!forms) {
      out.push(chars[i]);
      continue;
    }

    const linksBack = joinsForward(before(i));
    const linksOn = joinsBackward(next);

    const shape =
      linksBack && linksOn && forms[MEDIAL]
        ? forms[MEDIAL]
        : linksOn && forms[INITIAL]
          ? forms[INITIAL]
          : linksBack && forms[FINAL]
            ? forms[FINAL]
            : forms[ISOLATED];

    out.push(shape ? String.fromCodePoint(shape) : chars[i]);
  }

  return toVisualOrder(out);
}

/**
 * Reverse the letters, keeping every mark with the letter it sits on.
 *
 * A naive reverse would put a shadda before the letter it belongs to, and the
 * renderer would hang it over the letter next door. So the word is walked as
 * clusters — one letter plus whatever marks follow it — and it is the
 * clusters that are reversed.
 */
function toVisualOrder(letters: string[]): string {
  const clusters: string[][] = [];

  for (const letter of letters) {
    if (TRANSPARENT.test(letter) && clusters.length > 0) clusters[clusters.length - 1].push(letter);
    else clusters.push([letter]);
  }

  return clusters
    .reverse()
    .map((cluster) => cluster.join(''))
    .join('');
}
