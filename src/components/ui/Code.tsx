import type { ReactNode } from 'react';

/**
 * Syntax colour for the code the product shows as its own imagery.
 *
 * Deliberately tiny: this highlights the handful of token classes that appear
 * in a review excerpt or a portfolio tree, using accent shades and neutrals
 * only, so a diff still reads as part of the same palette rather than as a
 * rainbow pasted into it. It is not a parser and does not try to be one — if
 * the product ever renders arbitrary user code at scale, this is the seam
 * where a real highlighter goes.
 */
const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'await', 'async', 'export',
  'import', 'from', 'if', 'else', 'for', 'while', 'new', 'class', 'extends',
  'type', 'interface', 'def', 'lambda',
]);

type Token = { text: string; kind?: 'keyword' | 'string' | 'number' | 'punct' | 'comment' };

function tokenize(line: string): Token[] {
  const comment = line.match(/(\/\/|#).*$/);
  const code = comment ? line.slice(0, comment.index) : line;
  const tail: Token[] = comment ? [{ text: comment[0], kind: 'comment' }] : [];

  const tokens: Token[] = [];
  // Strings first, so their contents are never re-tokenised as keywords.
  for (const chunk of code.split(/("[^"]*"|'[^']*'|`[^`]*`)/)) {
    if (!chunk) continue;
    if (/^["'`]/.test(chunk)) {
      tokens.push({ text: chunk, kind: 'string' });
      continue;
    }
    for (const word of chunk.split(/(\b\w+\b|[^\w\s])/)) {
      if (!word) continue;
      if (KEYWORDS.has(word)) tokens.push({ text: word, kind: 'keyword' });
      else if (/^\d+$/.test(word)) tokens.push({ text: word, kind: 'number' });
      else if (/^[^\w\s]$/.test(word)) tokens.push({ text: word, kind: 'punct' });
      else tokens.push({ text: word });
    }
  }

  return [...tokens, ...tail];
}

export function CodeLine({ text }: { text: string }): ReactNode {
  return tokenize(text).map((token, index) => (
    <span key={index} className={token.kind ? `tok-${token.kind}` : undefined}>
      {token.text}
    </span>
  ));
}
