import type { ReactNode } from 'react';

/**
 * The small label above a heading.
 *
 * Latin sets it in mono, uppercase, with 0.16em tracking. Arabic has no case
 * and is never letter-spaced, so the same role is carried by size and color —
 * that switch lives in rtl.css and follows the page's language automatically.
 *
 * `code` marks a kicker that is a Latin technical fragment rather than prose;
 * it keeps the mono treatment inside an Arabic page.
 */
export function Kicker({
  children,
  code = false,
  className,
}: {
  children: ReactNode;
  code?: boolean;
  className?: string;
}) {
  return (
    <span
      className={['kicker', code ? 'ltr' : null, className].filter(Boolean).join(' ')}
      dir={code ? 'ltr' : undefined}
    >
      {children}
    </span>
  );
}
