import { useTranslations } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { Link } from '@/i18n/navigation';
import { Num } from '@/components/ui/Bidi';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import type { Track } from '@/content/tracks';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

/**
 * A track, as a card.
 *
 * The whole card is the hit area — the title's ::after covers it — so the
 * pointer target matches what the card looks like, while the accessible name
 * stays the title rather than "read more". Hierarchy runs kicker, title,
 * outcome, meta: the outcome is what sells a track, so it sits above the fold
 * of the card rather than in the meta row.
 */
export function TrackCard({ track, locale }: { track: Track; locale: Locale }) {
  const t = useTranslations();

  return (
    <article className="card card-interactive">
      <div className="card-kicker">{t('home.weeks', { count: track.weekCount })}</div>

      <h3 className="card-title">
        <Link href={`/tracks/${track.slug}`} className="card-link">
          {pick(track.title, locale)}
        </Link>
      </h3>

      <p className="card-body">{pick(track.summary, locale)}</p>

      <div className="flow-2">
        <span className="t-fine text-muted">{t('track.outcomeTitle')}</span>
        <span className="t-small">{pick(track.outcome, locale)}</span>
      </div>

      <div className="card-meta">
        {track.priceMinor !== undefined ? (
          <span className="t-small text-secondary">
            <Num>{(track.priceMinor / 100).toLocaleString('en-US')}</Num> {track.currency}
          </span>
        ) : (
          <PlaceholderNote>{t('placeholder.price')}</PlaceholderNote>
        )}
        <span style={{ marginInlineStart: 'auto' }} className="text-accent" aria-hidden>
          <ArrowRight size={14} className="mirror-rtl" />
        </span>
      </div>
    </article>
  );
}
