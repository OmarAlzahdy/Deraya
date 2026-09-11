import type { ReactNode } from 'react';

/**
 * Surface-filled content card with a hairline edge. Elevation is an edge plus
 * ambient darkness — pass `elevation` only when the card genuinely lifts.
 */
export function Card({
  kicker,
  title,
  meta,
  elevation = 'sm',
  className,
  children,
}: {
  kicker?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  elevation?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <article className={['card', `elev-${elevation}`, className].filter(Boolean).join(' ')}>
      {kicker ? <div className="card-kicker">{kicker}</div> : null}
      {title ? <h3 className="card-title">{title}</h3> : null}
      {children ? <div className="card-body">{children}</div> : null}
      {meta ? <div className="card-meta">{meta}</div> : null}
    </article>
  );
}
