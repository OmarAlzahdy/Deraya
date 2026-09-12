import { useLocale } from 'next-intl';
import { Ltr } from '@/components/ui/Bidi';
import type { ProofArtifact } from '@/content/proof';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

/**
 * A diff with a line-anchored comment from a named engineer — the product's
 * own material, used as the page's imagery and as its proof.
 *
 * The bilingual case this exists to get right: the code, the path and the line
 * numbers are an LTR island, while the engineer's comment runs in the page's
 * own direction. Both live in one block without either reordering the other.
 *
 * This is the component screen 08 (review thread) grows out of, so the shape
 * is the real one: hunks, signs, line numbers, an anchor.
 */
export function ReviewExcerpt({
  artifact,
  compact = false,
}: {
  artifact: ProofArtifact;
  /** The hero rail shows the head and the comment, not the whole hunk. */
  compact?: boolean;
}) {
  const locale = useLocale() as Locale;
  const lines = compact
    ? artifact.lines.slice(0, artifact.comment.anchorLine)
    : artifact.lines;

  return (
    <div className={['diff', compact ? 'diff-compact' : null].filter(Boolean).join(' ')}>
      <div className="diff-head">
        <Ltr>{artifact.repo}</Ltr>
        <span aria-hidden>·</span>
        <Ltr>{artifact.branch}</Ltr>
        <span aria-hidden>·</span>
        <Ltr>{artifact.filePath}</Ltr>
      </div>

      <div className="diff-body">
        {lines.map((line, index) => (
          <div key={`${line.lineNumber}-${index}`}>
            <div
              className={[
                'diff-line',
                line.sign === '+' ? 'diff-add' : null,
                line.sign === '-' ? 'diff-del' : null,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="diff-num">{line.sign === '+' ? line.lineNumber : line.lineNumber}</span>
              <span className="diff-sign">{line.sign.trim()}</span>
              <span>{line.text}</span>
            </div>

            {index + 1 === artifact.comment.anchorLine ? (
              <div className="review-comment">
                <div className="review-comment-head">
                  <strong style={{ fontWeight: 500, color: 'var(--color-text)' }}>
                    {pick(artifact.comment.author, locale)}
                  </strong>
                </div>
                <p>{pick(artifact.comment.body, locale)}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
