import { useLocale } from 'next-intl';
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import { Avatar } from '@/components/ui/Avatar';
import type { Person } from '@/content/people';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

/**
 * A named practitioner.
 *
 * Until the team is decided (open decision 5) the name is a marker rather than
 * an invented person, and the photograph is the striped placeholder — no
 * photography exists. `compact` is the rail form: an avatar beside the name
 * instead of a portrait above it.
 */
export function PersonCard({
  person,
  photoCaption,
  compact = false,
}: {
  person: Person;
  photoCaption: string;
  compact?: boolean;
}) {
  const locale = useLocale() as Locale;
  const headline = pick(person.headline, locale);

  if (compact) {
    return (
      <article className="card" style={{ gap: 'var(--space-4)' }}>
        <div className="row row-4" style={{ flexWrap: 'nowrap' }}>
          <Avatar name={person.placeholder ? '?' : person.displayName} size="lg" staff />
          <div className="flow-1">
            {person.placeholder ? null : (
              <span className="t-title">{person.displayName}</span>
            )}
            <span className="t-fine text-muted">{headline}</span>
          </div>
        </div>
        {person.placeholder ? <PlaceholderNote /> : null}
      </article>
    );
  }

  return (
    <article className="flow-3">
      {person.avatarUrl ? (
        <figure className="blend-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={person.avatarUrl} alt={person.displayName} />
        </figure>
      ) : (
        <PlaceholderMedia caption={photoCaption} ratio="4 / 5" />
      )}

      <div className="flow-1">
        {/* No name until there is a real one — an em dash standing in for a
            person reads worse than the marker below saying so. */}
        {person.placeholder ? null : <span className="t-title">{person.displayName}</span>}
        <span className="t-small text-muted">{headline}</span>
      </div>

      {person.placeholder ? <PlaceholderNote /> : null}
    </article>
  );
}
