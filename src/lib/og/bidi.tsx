import { HAS_ARABIC, shapeArabic } from './arabic';

/**
 * Word ordering for the share cards.
 *
 * Satori — the renderer behind `next/og` — shapes Arabic correctly: letters
 * join, ligatures form, a word looks like a word. What it does not do is the
 * bidirectional algorithm. It lays every word out left to right, whatever the
 * `direction` style says, so an Arabic sentence comes out with its words in
 * reverse and reads as nonsense. Nothing in CSS fixes it, because there is no
 * CSS engine here; only Yoga, laying out boxes.
 *
 * So the ordering is done with boxes. Each word becomes a flex item and the
 * row runs `row-reverse` for Arabic, which puts the first word at the right
 * edge and wraps onto a new line below — which is what an Arabic paragraph
 * is. A run of the other script (a track called "Applied AI", a price in
 * Latin digits) goes into a nested row running the other way, so it keeps its
 * own order inside the sentence. That is the bidi algorithm at word
 * granularity: not the full Unicode one, but exact for the copy these cards
 * carry.
 */

const LATIN = /[A-Za-z0-9@#]/;

type Dir = 'rtl' | 'ltr';

/** The direction a single token belongs to, or null when it takes the run's. */
function tokenDirection(token: string): Dir | null {
  if (HAS_ARABIC.test(token)) return 'rtl';
  if (LATIN.test(token)) return 'ltr';
  // Punctuation on its own — a bullet, a dash, an ellipsis — is neutral and
  // stays with whatever it was written beside.
  return null;
}

type Run = { dir: Dir; words: string[] };

function runs(text: string, base: Dir): Run[] {
  const out: Run[] = [];

  for (const word of text.split(/\s+/).filter(Boolean)) {
    const dir = tokenDirection(word) ?? out.at(-1)?.dir ?? base;
    const last = out.at(-1);
    if (last && last.dir === dir) last.words.push(word);
    else out.push({ dir, words: [word] });
  }

  return out;
}

export type ParaProps = {
  children: string;
  base: Dir;
  /** Font size in px. Word and line spacing are derived from it. */
  size: number;
  lineHeight: number;
  weight?: 400 | 500;
  color?: string;
  letterSpacing?: string;
  maxWidth?: number;
  marginTop?: number;
};

/**
 * A paragraph of mixed-script text, laid out in the reading order of `base`.
 *
 * Pure Latin text skips all of this and renders as one span: satori's own
 * line breaking is better than word boxes at justifying a long English line,
 * and it has no ordering to get wrong.
 */
export function Para({
  children,
  base,
  size,
  lineHeight,
  weight = 400,
  color,
  letterSpacing,
  maxWidth,
  marginTop,
}: ParaProps) {
  // Satori reads every key it is given, including the ones set to
  // `undefined`, and trips over them. So the optional ones are only added
  // when they have a value.
  const shared: React.CSSProperties = {
    fontSize: size,
    lineHeight,
    fontWeight: weight,
    ...(color === undefined ? {} : { color }),
    ...(letterSpacing === undefined ? {} : { letterSpacing }),
    ...(maxWidth === undefined ? {} : { maxWidth }),
    ...(marginTop === undefined ? {} : { marginTop }),
  };

  if (!HAS_ARABIC.test(children)) {
    return <span style={{ ...shared, display: 'flex' }}>{children}</span>;
  }

  // A space is a word gap here, not a character, so it is set as one: a
  // quarter of the size reads the same as the font's own space at these
  // sizes, and stays even when a line wraps.
  const gap = Math.round(size * 0.26);
  const grouped = runs(children, base);

  return (
    <div
      style={{
        ...shared,
        display: 'flex',
        flexDirection: base === 'rtl' ? 'row-reverse' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'baseline',
        columnGap: gap,
      }}
    >
      {grouped.flatMap((run, index) =>
        run.dir === base
          ? run.words.map((word, wordIndex) => (
              <span key={`${index}-${wordIndex}`}>{shapeArabic(word)}</span>
            ))
          : [
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: run.dir === 'rtl' ? 'row-reverse' : 'row',
                  flexWrap: 'wrap',
                  columnGap: gap,
                }}
              >
                {run.words.map((word, wordIndex) => (
                  <span key={wordIndex}>{shapeArabic(word)}</span>
                ))}
              </div>,
            ],
      )}
    </div>
  );
}
