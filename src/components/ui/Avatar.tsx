/**
 * A person, before there are photographs.
 *
 * No photography exists yet (handoff: *Assets*), so the initial does the work.
 * It keeps the same footprint a photograph will take, so nothing moves when
 * one arrives, and staff carry an accent ring rather than a second colour.
 */
export function Avatar({
  name,
  staff = false,
  size = 'md',
  className,
}: {
  name: string;
  staff?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const initial = name.trim().charAt(0) || '—';

  return (
    <span
      className={['avatar', size === 'lg' ? 'avatar-lg' : null, staff ? 'avatar-staff' : null, className]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
