import type { ReactNode } from 'react';
import { CheckCircle, WarningCircle, Warning, Circle } from '@phosphor-icons/react/dist/ssr';

type Tone = 'success' | 'danger' | 'warning' | 'neutral';

const glyph = {
  success: CheckCircle,
  danger: WarningCircle,
  warning: Warning,
  neutral: Circle,
} as const;

/**
 * A status is a mark plus a word. Color reinforces it and never carries it
 * alone — success in particular has no hue of its own (open decision 2: the
 * accent is already a teal-green, and a second green would read as a second
 * accent in a mono palette), so the check mark is the whole signal.
 */
export function Status({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  const Glyph = glyph[tone];

  return (
    <span className={['status', `status-${tone}`, className].filter(Boolean).join(' ')}>
      <Glyph size={15} weight="regular" aria-hidden />
      <span>{children}</span>
    </span>
  );
}
