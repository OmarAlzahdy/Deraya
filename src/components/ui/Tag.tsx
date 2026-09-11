import type { ReactNode } from 'react';

/** Mono palette: there is no second accent, so there is no `accent-2` tag. */
type Tone = 'accent' | 'neutral' | 'outline';

const toneClass: Record<Tone, string> = {
  accent: 'tag-accent',
  neutral: 'tag-neutral',
  outline: 'tag-outline',
};

export function Tag({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span className={['tag', toneClass[tone], className].filter(Boolean).join(' ')}>
      {children}
    </span>
  );
}
