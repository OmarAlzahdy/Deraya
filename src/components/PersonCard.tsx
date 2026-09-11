import { useLocale } from 'next-intl';
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import type { Person } from '@/content/people';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

/**
 * A named practitioner with a face. Until the team is decided (open decision 5)
 * the name is a marker rather than an invented person, and the photograph is
 * the striped placeholder — no photography exists.
 */
export function PersonCard({ person, photoCaption }: { person: Person; photoCaption: string }) {
  const locale = useLocale() as Locale;

  return (
    <article className="stack stack-3">
      {person.avatarUrl ? (
        <figure className="lighten">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={person.avatarUrl} alt={person.displayName} />
        </figure>
      ) : (
        <PlaceholderMedia caption={photoCaption} ratio="1 / 1" />
      )}

      <div className="stack stack-1">
        {/* No name until there is a real one — an em dash standing in for a
            person reads worse than the marker below saying so. */}
        {person.placeholder ? null : <span className="t-title">{person.displayName}</span>}
        <span className="t-small text-muted">{pick(person.headline, locale)}</span>
      </div>

      {person.placeholder ? <PlaceholderNote /> : null}
    </article>
  );
}
