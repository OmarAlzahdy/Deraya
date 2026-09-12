import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { PersonCard } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { CodeBlock, Num } from '@/components/ui/Bidi';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import type { Track } from '@/content/tracks';
import { getTrackBySlug } from '@/lib/data/tracks';
import { getPerson } from '@/content/people';
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
 * Required and present: the week-by-week outline, what you will build, what
 * gets reviewed and by whom, prerequisites, the instructor, price, and what the
 * finished portfolio looks like. The two slots that cannot honestly be filled
 * yet — the week subjects (open decision 3) and the price (open decision 4) —
 * render as marked gaps rather than invented specifics.
 *
 * No wireframe exists for this screen; the layout is a proposal.
 */
function TrackDetail({ track }: { track: Track }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const reviewedCount = track.weeks.filter((week) => week.reviewed).length;
  const instructor = getPerson(track.instructorIds[0] ?? '');

  return (
    <>
      <a href="#main" className="sr-only">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <header className="stack stack-6">
          <Kicker>{t('track.kicker')}</Kicker>
          <h1 className="measure-tight">{pick(track.title, locale)}</h1>
          <p className="t-body text-secondary measure">{pick(track.summary, locale)}</p>

          <div className="row" style={{ gap: 'var(--space-6)' }}>
            <span className="t-small text-muted">{t('home.weeks', { count: track.weekCount })}</span>
            <span className="t-small text-muted">
              {t('home.reviewedWeeks', { count: reviewedCount })}
            </span>
          </div>

          <div className="stack stack-2">
            <span className="t-fine text-muted">{t('track.outcomeTitle')}</span>
            <p className="t-title measure">{pick(track.outcome, locale)}</p>
          </div>

          {/* The CTA slot is real; the flow behind it is not. Enrollment needs
              auth and a payment path, neither of which exists — so the button
              says what it will do and the marker says it does not do it yet,
              rather than linking somewhere that cannot honour it. */}
          <div className="row">
            <Button variant="primary" disabled>
              {t('cta.startTrack')}
            </Button>
            <PlaceholderNote>{t('placeholder.enrollment')}</PlaceholderNote>
          </div>
        </header>

        {/* ── Week by week ─────────────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('track.outlineTitle')}</h2>
            {track.weeks.some((week) => week.placeholder) ? (
              <PlaceholderNote>{t('placeholder.weeks')}</PlaceholderNote>
            ) : null}
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ inlineSize: '6ch' }}>{t('track.weekColumn')}</th>
                <th>{t('track.topicColumn')}</th>
                <th>{t('track.outputColumn')}</th>
                <th style={{ inlineSize: '12ch' }}>{t('track.reviewColumn')}</th>
              </tr>
            </thead>
            <tbody>
              {track.weeks.map((week) => (
                <tr key={week.weekNumber}>
                  <td>
                    <Num>{String(week.weekNumber).padStart(2, '0')}</Num>
                  </td>
                  <td>{pick(week.title, locale)}</td>
                  <td className="text-muted">
                    {week.outline ? pick(week.outline, locale) : '—'}
                  </td>
                  <td>
                    {week.reviewed ? (
                      <span className="status status-success">
                        <CheckCircle size={15} aria-hidden />
                        <span>{t('track.reviewedBadge')}</span>
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── What gets reviewed ───────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('track.reviewTitle')}</h2>
            <p className="measure text-secondary t-small">{t('track.reviewBody')}</p>
          </div>

          <div className="grid grid-wide">
            <div className="stack stack-3">
              <span className="t-fine text-muted">{t('track.instructorTitle')}</span>
              {instructor ? (
                <div style={{ maxInlineSize: '240px' }}>
                  <PersonCard person={instructor} photoCaption={t('placeholder.person')} />
                </div>
              ) : null}
            </div>

            <div className="stack stack-6">
              <div className="stack stack-2">
                <span className="t-fine text-muted">{t('track.prerequisitesTitle')}</span>
                <p className="t-small">
                  {track.prerequisites
                    ? pick(track.prerequisites, locale)
                    : t('track.prerequisitesBody')}
                </p>
              </div>

              <div className="stack stack-2">
                <span className="t-fine text-muted">{t('track.priceTitle')}</span>
                {/* Open decision 4. A made-up number on a page a buyer reads is
                    worse than a visible gap. */}
                {track.priceMinor === undefined ? (
                  <PlaceholderNote>{t('placeholder.price')}</PlaceholderNote>
                ) : (
                  <span className="t-title">
                    <Num>{(track.priceMinor / 100).toLocaleString('en-US')}</Num> {track.currency}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── The finished portfolio ───────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('track.portfolioTitle')}</h2>
            <p className="measure text-secondary t-small">{t('track.portfolioBody')}</p>
          </div>

          {/* The preview is the product's own material: a repository tree.
              Generic scaffolding until a real finished portfolio exists. */}
          <div className="stack stack-3" style={{ maxInlineSize: '440px' }}>
            <div className="panel-sunken">
              <CodeBlock>{`rag-service/
├── src/
│   ├── retrieval/
│   └── eval/
├── tests/
├── .github/workflows/ci.yml
└── README.md`}</CodeBlock>
            </div>
            <PlaceholderNote />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
