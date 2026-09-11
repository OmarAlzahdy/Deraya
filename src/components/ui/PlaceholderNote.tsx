import { useTranslations } from 'next-intl';

/**
 * The visible marker on content the brief has not decided. It names what is
 * missing rather than hiding the gap — see src/content/ and the open decisions
 * in README.md.
 */
export function PlaceholderNote({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('placeholder');
  return <span className="placeholder-note">{children ?? t('pending')}</span>;
}
