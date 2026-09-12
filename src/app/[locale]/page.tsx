import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ReviewExcerpt } from '@/components/ReviewExcerpt';
import { PersonCard } from '@/components/PersonCard';
import { TrackCard } from '@/components/TrackCard';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import { Link } from '@/i18n/navigation';
import { getPublishedTracks } from '@/lib/data/tracks';
import { people } from '@/content/people';
import { proof } from '@/content/proof';
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

  const tracks = await getPublishedTracks();
  return <Home tracks={tracks} />;
}

/**
 * Screen 01 — Home.
 *
 * Convince a visitor in one screen that this is run by practising engineers.
 * The composition does that structurally: the claim and the proof share the
 * first screen, so the evidence arrives with the assertion rather than four
 * scrolls later. The trailing columns hold the review artifact instead of the
 * void the earlier layout left there.
 *
 * Explicitly excluded by the brief and absent here: carousel, testimonial
 * wall, logo soup, counters.
 */
function Home({ tracks }: { tracks: Track[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main">
        {/* ── Hero: the claim and the evidence, together ───────────────── */}
        <section className="shell" style={{ paddingBlock: 'var(--section-gap-tight) var(--section-gap)' }}>
          <div className="grid-editorial">
            <div className="col-content flow-5">
              <div className="flow-4">
                <Kicker>{t('home.enginesKicker')}</Kicker>
                <h1 className="t-display measure-tight">{t('hero.headline')}</h1>
                <p className="t-lead measure-lead">{t('hero.subhead')}</p>
              </div>

              <div className="row row-4">
                <Button href="/tracks" variant="primary" className="btn-lg">
                  {t('cta.startTrack')}
                  <ArrowRight size={16} className="mirror-rtl" aria-hidden />
                </Button>
                <Button href="/services" variant="secondary" className="btn-lg">
                  {t('cta.bookReview')}
                </Button>
              </div>

              <p className="t-small text-muted">{t('hero.supporting.three')}</p>
            </div>

            {/* The strongest thing the brand owns, on the first screen. */}
            <aside className="col-rail flow-3" aria-label={t('home.proofKicker')}>
              <ReviewExcerpt artifact={proof} compact />
              <div className="row">
                <span className="t-fine text-muted">{t('home.proofNote')}</span>
                {proof.placeholder ? <PlaceholderNote>{t('placeholder.proof')}</PlaceholderNote> : null}
              </div>
            </aside>
          </div>
        </section>

        {/* ── The one full-bleed band the system allows per page ────────── */}
        <section className="band">
          <div className="shell band-inner">
            <hr className="mark-accent" />
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
            <p className="lead">{t('home.enginesBody')}</p>
          </div>

          <div className="grid-2">
            <article className="card">
              <div className="card-kicker">{t('home.engineLearn')}</div>
              <h3 className="card-title">{t('home.learnTitle')}</h3>
              <p className="card-body">{t('home.learnBody')}</p>
              <div className="actions">
                <Button href="/tracks" variant="primary">
                  {t('cta.startTrack')}
                  <ArrowRight size={14} className="mirror-rtl" aria-hidden />
                </Button>
              </div>
            </article>

            <article className="card">
              <div className="card-kicker">{t('home.engineBuild')}</div>
              <h3 className="card-title">{t('home.buildTitle')}</h3>
              <p className="card-body">{t('home.buildBody')}</p>
              <div className="actions">
                <Button href="/services" variant="primary">
                  {t('cta.bookReview')}
                  <ArrowRight size={14} className="mirror-rtl" aria-hidden />
                </Button>
              </div>
            </article>
          </div>
        </section>

        {/* ── Tracks ───────────────────────────────────────────────────── */}
        <section className="shell section">
          <div className="toolbar">
            <div className="section-head" style={{ marginBlockEnd: 0 }}>
              <Kicker>{t('home.tracksKicker')}</Kicker>
              <h2>{t('home.tracksTitle')}</h2>
              <p className="lead">{t('home.tracksBody')}</p>
            </div>
            <Link href="/tracks" className="btn btn-ghost">
              {t('home.seeAllTracks')}
              <ArrowRight size={14} className="mirror-rtl" aria-hidden />
            </Link>
          </div>

          {tracks.length === 0 ? (
            <p className="empty-state">{t('home.noTracks')}</p>
          ) : (
            <div className="grid-cards">
              {tracks.slice(0, 3).map((track) => (
                <TrackCard key={track.slug} track={track} locale={locale} />
              ))}
            </div>
          )}
        </section>

        {/* ── Proof, at full width ─────────────────────────────────────── */}
        <section className="shell section">
          <div className="grid-editorial">
            <div className="col-content flow-4">
              <Kicker>{t('home.proofKicker')}</Kicker>
              <h2 className="measure-tight">{t('home.proofTitle')}</h2>
              <p className="lead measure-lead">{t('home.proofBody')}</p>
            </div>
          </div>

          <div className="flow-3" style={{ marginBlockStart: 'var(--flow-5)' }}>
            <ReviewExcerpt artifact={proof} />
            {proof.placeholder ? <PlaceholderNote>{t('placeholder.proof')}</PlaceholderNote> : null}
          </div>
        </section>

        {/* ── Named practitioners ──────────────────────────────────────── */}
        <section className="shell section">
          <div className="section-head">
            <Kicker>{t('home.teamKicker')}</Kicker>
            <h2>{t('home.teamTitle')}</h2>
            <p className="lead">{t('home.teamBody')}</p>
          </div>

          <div className="grid-cards">
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
