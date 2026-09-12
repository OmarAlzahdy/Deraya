import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ReviewExcerpt } from '@/components/ReviewExcerpt';
import { PersonCard } from '@/components/PersonCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Kicker } from '@/components/ui/Kicker';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import { getPublishedTracks } from '@/lib/data/tracks';
import { people } from '@/content/people';
import { proof } from '@/content/proof';
import { pick } from '@/content/types';
import type { Track } from '@/content/tracks';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'hero' });
  return { description: t('subhead') };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Tracks come from the database once a project is connected; before that the
  // data layer falls back to the placeholder module, markers intact.
  const tracks = await getPublishedTracks();
  return <Home tracks={tracks} />;
}

/**
 * Screen 01 — Home.
 *
 * The job is to convince a visitor in one screen that this is run by practising
 * engineers, so the order is: the claim, the two engines, the tracks, the proof,
 * the people. The proof artifact is a review comment on code rather than a
 * testimonial, which is the one thing on the page a competitor cannot copy.
 *
 * Explicitly excluded by the brief and absent here: carousel, testimonial wall,
 * logo soup, counters.
 *
 * The layout has not been through a design review — no wireframe exists for
 * this screen. Content marked pending comes from src/content/, where every
 * placeholder names the decision that fills it.
 */
function Home({ tracks }: { tracks: Track[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <>
      <a href="#main" className="sr-only">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="shell" style={{ paddingBlock: 'var(--space-16) var(--space-24)' }}>
          <div className="stack stack-6">
            <h1 className="t-display measure-tight">{t('hero.headline')}</h1>
            <p className="t-body text-secondary measure">{t('hero.subhead')}</p>
            <p className="t-small text-muted measure">{t('brand.positioning')}</p>

            {/* One CTA per engine — Learn, then Build. */}
            <div className="row" style={{ gap: 'var(--space-4)' }}>
              <a className="btn btn-primary" href="#tracks">
                {t('cta.startTrack')}
                <ArrowRight size={14} className="mirror-rtl" aria-hidden />
              </a>
              <Button href="/services" variant="secondary">
                {t('cta.bookReview')}
              </Button>
            </div>
          </div>
        </section>

        {/* ── The one full-bleed band the system allows per page ────────── */}
        <section className="band">
          <div className="shell">
            <p className="t-section measure-tight" style={{ margin: 0 }}>
              {t('hero.supporting.one')}
            </p>
          </div>
        </section>

        {/* ── Two engines ──────────────────────────────────────────────── */}
        <section className="shell section">
          <div className="section-head">
            <Kicker>{t('home.enginesKicker')}</Kicker>
            <h2>{t('home.enginesTitle')}</h2>
            <p className="measure text-secondary t-small">{t('home.enginesBody')}</p>
          </div>

          <div className="grid grid-wide">
            <Card kicker={t('home.learnTitle')} title={t('hero.supporting.three')}>
              <div className="stack stack-4">
                <p style={{ margin: 0 }}>{t('home.learnBody')}</p>
                <a className="btn btn-primary" href="#tracks" style={{ alignSelf: 'flex-start' }}>
                  {t('cta.startTrack')}
                </a>
              </div>
            </Card>

            <Card kicker={t('home.buildTitle')} title={t('hero.supporting.two')}>
              <div className="stack stack-4">
                <p style={{ margin: 0 }}>{t('home.buildBody')}</p>
                <Button href="/services" variant="primary" style={{ alignSelf: 'flex-start' }}>
                  {t('cta.bookReview')}
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Three tracks ─────────────────────────────────────────────── */}
        <section className="shell section" id="tracks">
          <div className="section-head">
            <Kicker>{t('home.tracksKicker')}</Kicker>
            <h2>{t('home.tracksTitle')}</h2>
            <p className="measure text-secondary t-small">{t('home.tracksBody')}</p>
          </div>

          {tracks.length === 0 ? (
            <p className="panel-sunken measure t-small text-muted">{t('home.noTracks')}</p>
          ) : null}

          <div className="grid">
            {tracks.map((track) => (
              <Card
                key={track.slug}
                kicker={t('home.weeks', { count: track.weekCount })}
                title={pick(track.title, locale)}
                meta={track.placeholder ? <PlaceholderNote /> : null}
              >
                <div className="stack stack-4">
                  <p style={{ margin: 0 }}>{pick(track.summary, locale)}</p>
                  <div className="stack stack-1">
                    <span className="t-fine text-muted">{t('track.outcomeTitle')}</span>
                    <span className="t-small">{pick(track.outcome, locale)}</span>
                  </div>
                  <Button href={`/tracks/${track.slug}`} variant="ghost">
                    {t('cta.viewTrack')}
                    <ArrowRight size={14} className="mirror-rtl" aria-hidden />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Proof: a review, not a testimonial ───────────────────────── */}
        <section className="shell section">
          <div className="section-head">
            <Kicker>{t('home.proofKicker')}</Kicker>
            <h2 className="measure-tight">{t('home.proofTitle')}</h2>
            <p className="measure text-secondary t-small">{t('home.proofBody')}</p>
          </div>

          <div className="stack stack-3">
            <ReviewExcerpt artifact={proof} />
            {proof.placeholder ? <PlaceholderNote>{t('placeholder.proof')}</PlaceholderNote> : null}
          </div>
        </section>

        {/* ── Named practitioners ──────────────────────────────────────── */}
        <section className="shell section">
          <div className="section-head">
            <Kicker>{t('home.teamKicker')}</Kicker>
            <h2>{t('home.teamTitle')}</h2>
            <p className="measure text-secondary t-small">{t('home.teamBody')}</p>
          </div>

          <div className="grid">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} photoCaption={t('placeholder.person')} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
