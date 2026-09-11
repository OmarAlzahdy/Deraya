/**
 * Loading is a skeleton built from --color-surface on --color-bg, not a
 * spinner. Sizes are given by the caller so the skeleton matches the shape of
 * what is arriving.
 */
export function Skeleton({
  width = '100%',
  height = 'var(--space-8)',
  radius = 'var(--radius-sm)',
  className,
}: {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}) {
  return (
    <div
      className={['skeleton', className].filter(Boolean).join(' ')}
      style={{ inlineSize: width, blockSize: height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}
