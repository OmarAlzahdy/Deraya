'use client';

import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

/**
 * Phosphor icons, inline on currentColor.
 *
 * `directional` marks the glyphs that mirror under RTL — arrows, chevrons,
 * back/forward, progress. Everything else (a clock, a check, a magnifier, a
 * play triangle) keeps its orientation in both directions, so the prop is
 * opt-in rather than a blanket flip.
 */
export function Icon({
  as: Glyph,
  size = 16,
  weight = 'regular',
  directional = false,
  className,
  label,
}: {
  as: PhosphorIcon;
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  directional?: boolean;
  className?: string;
  /** Omit for decorative icons; the glyph is then hidden from assistive tech. */
  label?: string;
}) {
  return (
    <Glyph
      size={size}
      weight={weight}
      className={[directional ? 'mirror-rtl' : null, className].filter(Boolean).join(' ')}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
    />
  );
}
