import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle, Circle } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PersonCard } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { CodeBlock, Num } from '@/components/ui/Bidi';
import { Link } from '@/i18n/navigation';
import type { Track } from '@/content/tracks';
import { getTrackBySlug } from '@/lib/data/tracks';
import { namedPeople } from '@/content/people';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const track = await getTrackBySlug(slug);
  if (!track) return {};
  const t = await getTranslations({ locale, namespace: 'track' });
  return {
    title: `${t('kicker')} · ${track.title[locale as Locale]}`,
    description: track.summary[locale as Locale],
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const track = await getTrackBySlug(slug);
  if (!track) notFound();

  return <TrackDetail track={track} />;
}

/**
 * Screen 02 — Track detail. The brief calls it the heart of the product.
 *
 * Two columns: the outline reads down the leading side while the facts a buyer
 * needs — price, length, what gets reviewed, the instructor — stay in a sticky
 * card on the trailing side. That is what the whitespace on the trailing edge
 * is *for*, and it means the price is on screen at the moment the reader is
 * deciding, wherever they are in a twelve-week outline.
 *
 * The week list is a list, not a table: twelve rows of two columns read better
 * as a sequence, and it collapses to one column on a phone without a scroller.
 */
function TrackDetail({ track }: { track: Track }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const reviewedCount = track.weeks.filter((week) => week.reviewed).length;
  // The brief requires the instructor here, but an unnamed placeholder is
  // scaffolding on a public page — same rule as the home page's team section.
  // The slot appears when a real person is assigned; until then the admin area
  // is where the gap is visible.
  const instructor = namedPeople.find((person) => person.id === track.instructorIds[0]);

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <div className="grid-editorial">
          {/* ── The content column ───────────────────────────────────── */}
          <div className="col-content">
            <header className="flow-4">
              <Kicker>
                <Link href="/tracks" style={{ border: 0, color: 'inherit' }}>
                  {t('tracks.title')}
                </Link>
              </Kicker>
              <h1 className="measure-tight">{pick(track.title, locale)}</h1>
              <p className="t-lead measure-lead">{pick(track.summary, locale)}</p>
            </header>

            <div className="panel flow-2" style={{ marginBlockStart: 'var(--flow-5)' }}>
              <span className="t-fine text-muted">{t('track.outcomeTitle')}</span>
              <p className="t-subsection">{pick(track.outcome, locale)}</p>
            </div>

            {/* ── Week by week ───────────────────────────────────────── */}
            <section className="section-tight">
              <div className="section-divider">
                <h2>{t('track.outlineTitle')}</h2>
              </div>

              <ol
                className="flow-2"
                style={{ listStyle: 'none', padding: 0, margin: 'var(--flow-4) 0 0' }}
              >
                {track.weeks.map((week) => (
                  <li
                    key={week.weekNumber}
                    className="list-row"
                    style={{ gridTemplateColumns: 'auto minmax(0, 1fr) auto', paddingBlock: 'var(--space-6)' }}
                  >
                    <span className="t-mono t-fine text-muted" style={{ inlineSize: '3ch' }}>
                      <Num>{String(week.weekNumber).padStart(2, '0')}</Num>
                    </span>

                    <div className="flow-1">
                      <span className="t-small">{pick(week.title, locale)}</span>
                      {week.outline ? (
                        <span className="t-fine text-muted">{pick(week.outline, locale)}</span>
                      ) : null}
                    </div>

                    {week.reviewed ? (
                      <span className="status status-success t-fine">
                        <CheckCircle size={15} aria-hidden />
                        <span>{t('track.reviewedBadge')}</span>
                      </span>
                    ) : (
                      <span className="status status-neutral t-fine" aria-hidden>
                        <Circle size={15} />
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* ── What gets reviewed ─────────────────────────────────── */}
            <section className="section-tight">
              <div className="section-divider">
                <h2>{t('track.reviewTitle')}</h2>
              </div>
              <p className="measure t-body text-secondary">{t('track.reviewBody')}</p>
            </section>

            {/* ── The finished portfolio ─────────────────────────────── */}
            <section className="section-tight">
              <div className="section-divider">
                <h2>{t('track.portfolioTitle')}</h2>
              </div>
              <p className="measure t-body text-secondary">{t('track.portfolioBody')}</p>

              <div style={{ marginBlockStart: 'var(--flow-4)', maxInlineSize: '460px' }}>
                <div className="panel">
                  <CodeBlock>{`rag-service/
├── src/
│   ├── retrieval/
│   └── eval/
├── tests/
├── .github/workflows/ci.yml
└── README.md`}</CodeBlock>
                </div>
              </div>
            </section>
          </div>

          {/* ── The facts, pinned ────────────────────────────────────── */}
          <aside className="col-rail col-rail-sticky">
            <div className="card flow-4">
              <div className="stat-row" style={{ gap: 'var(--space-8)' }}>
                <div className="stat">
                  <span className="stat-value">
                    <Num>{track.weekCount}</Num>
                  </span>
                  <span className="stat-label">{t('tracks.weeksLabel')}</span>
                </div>
                <div className="stat">
                  <span className="stat-value">
                    <Num>{reviewedCount}</Num>
                  </span>
                  <span className="stat-label">{t('tracks.reviewedWeeks')}</span>
                </div>
              </div>

              <div className="flow-2">
                <span className="t-fine text-muted">{t('track.priceTitle')}</span>
                {track.priceMinor === undefined ? (
                  <span className="t-subsection text-secondary">{t('track.priceOnRequest')}</span>
                ) : (
                  <span className="t-section">
                    <Num>{(track.priceMinor / 100).toLocaleString('en-US')}</Num>{' '}
                    <span className="t-small text-muted">{track.currency}</span>
                  </span>
                )}
              </div>

              <div className="flow-2">
                <span className="t-fine text-muted">{t('track.prerequisitesTitle')}</span>
                <span className="t-small text-secondary">
                  {track.prerequisites
                    ? pick(track.prerequisites, locale)
                    : t('track.prerequisitesBody')}
                </span>
              </div>

              {/* The CTA slot is real; the flow behind it is not. Enrollment
                  needs auth and a payment path, so the button says what it
                  will do and the marker says it does not do it yet. */}
              {/* Enrolment needs auth and a payment path, neither of which
                  exists. The button states the intent and is inert rather than
                  linking somewhere that cannot honour it. */}
              <Button variant="primary" className="btn-block" disabled>
                {t('cta.startTrack')}
              </Button>
            </div>

            {instructor ? (
              <div className="flow-3" style={{ marginBlockStart: 'var(--space-12)' }}>
                <span className="t-fine text-muted">{t('track.instructorTitle')}</span>
                <PersonCard person={instructor} photoCaption={t('placeholder.person')} compact />
              </div>
            ) : null}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
