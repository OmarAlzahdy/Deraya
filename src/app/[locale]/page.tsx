import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, GraduationCap, Wrench } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { ReviewExcerpt } from '@/components/ReviewExcerpt';
import { PersonCard } from '@/components/PersonCard';
import { TrackCard } from '@/components/TrackCard';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { Link } from '@/i18n/navigation';
import { getPublishedTracks } from '@/lib/data/tracks';
import { namedPeople } from '@/content/people';
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
 * The claim and the evidence share the first screen, so the proof arrives with
 * the assertion rather than four scrolls later.
 *
 * Nothing unbuilt is on display. An earlier pass rendered striped boxes and
 * "pending" chips wherever content was undecided, which is the right instinct
 * for an internal review and the wrong one for the front page: a visitor read
 * a half-built site. Undecided content is now simply absent — the team section
 * appears when there are named people, prices when there are prices — and the
 * bookkeeping lives in the admin area, where the person who can fill the gap
 * will see it.
 *
 * Explicitly excluded by the brief and absent here: carousel, testimonial
 * wall, logo soup, counters.
 */
function Home({ tracks }: { tracks: Track[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const steps = [
    { title: t('home.step1Title'), body: t('home.step1Body') },
    { title: t('home.step2Title'), body: t('home.step2Body') },
    { title: t('home.step3Title'), body: t('home.step3Body') },
    { title: t('home.step4Title'), body: t('home.step4Body') },
  ];

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main">
        {/* ── Hero: the claim and the evidence, together ───────────────── */}
        <section
          className="shell hero"
          style={{ paddingBlock: 'var(--section-gap-tight) var(--section-gap)' }}
        >
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
              <p className="t-fine text-muted" style={{ margin: 0 }}>
                {t('home.proofNote')}
              </p>
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
            <article className="card flow-3">
              <span className="icon-tile">
                <GraduationCap size={20} aria-hidden />
              </span>
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

            <article className="card flow-3">
              <span className="icon-tile">
                <Wrench size={20} aria-hidden />
              </span>
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

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section className="section-surface">
          <div className="shell">
            <div className="section-head">
              <Kicker>{t('home.stepsKicker')}</Kicker>
              <h2>{t('home.stepsTitle')}</h2>
            </div>

            <ol className="steps" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {steps.map((step, index) => (
                <li key={step.title} className="step">
                  <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-body">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Tracks ───────────────────────────────────────────────────── */}
        {tracks.length > 0 ? (
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

            <div className="grid-cards">
              {tracks.slice(0, 3).map((track) => (
                <TrackCard key={track.slug} track={track} locale={locale} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Proof, at full width ─────────────────────────────────────── */}
        <section className="shell section">
          <div className="grid-editorial">
            <div className="col-content flow-4">
              <Kicker>{t('home.proofKicker')}</Kicker>
              <h2 className="measure-tight">{t('home.proofTitle')}</h2>
              <p className="lead measure-lead">{t('home.proofBody')}</p>
            </div>
          </div>

          <div style={{ marginBlockStart: 'var(--flow-5)' }}>
            <ReviewExcerpt artifact={proof} />
          </div>
        </section>

        {/* ── Named practitioners, once there are any ──────────────────── */}
        {namedPeople.length > 0 ? (
          <section className="shell section">
            <div className="section-head">
              <Kicker>{t('home.teamKicker')}</Kicker>
              <h2>{t('home.teamTitle')}</h2>
              <p className="lead">{t('home.teamBody')}</p>
            </div>

            <div className="grid-cards">
              {namedPeople.map((person) => (
                <PersonCard key={person.id} person={person} photoCaption={t('placeholder.person')} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── Closing call to action ───────────────────────────────────── */}
        <section className="shell section">
          <div className="cta-panel">
            <h2 className="t-section measure-tight">{t('home.ctaTitle')}</h2>
            <p className="t-lead measure-lead" style={{ margin: 0 }}>
              {t('home.ctaBody')}
            </p>
            <div className="row row-4">
              <Button href="/tracks" variant="primary" className="btn-lg">
                {t('cta.startTrack')}
                <ArrowRight size={16} className="mirror-rtl" aria-hidden />
              </Button>
              <Button href="/community" variant="secondary" className="btn-lg">
                {t('cta.browseCommunity')}
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
