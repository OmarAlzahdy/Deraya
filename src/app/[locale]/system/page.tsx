import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ArrowRight, CaretRight, Clock, CheckCircle, GitBranch } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Kicker } from '@/components/ui/Kicker';
import { Skeleton } from '@/components/ui/Skeleton';
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia';
import { CodeBlock, LangRun, Ltr, Num } from '@/components/ui/Bidi';
import { FormDemo } from '@/components/system/FormDemo';
import { Ramp, RoleSwatch } from '@/components/system/Swatches';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'foundations' });
  return { title: t('title') };
}

const SPACING_STEPS = ['1', '2', '3', '4', '6', '8', '12', '16'] as const;

export default async function SystemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Foundations />;
}

/**
 * The foundations reference: tokens, type, direction and the component classes
 * rendered in whichever language the reader is in. This is not one of the eight
 * product screens — it is the proof that the layer under them works, and the
 * page to check a change against.
 */
function Foundations() {
  const t = useTranslations();

  return (
    <>
      <a href="#main" className="sr-only">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <header className="stack stack-6">
          <Kicker>{t('foundations.kicker')}</Kicker>
          <h1>{t('foundations.title')}</h1>
          <p className="measure text-secondary">{t('foundations.intro')}</p>
          <p className="panel-sunken measure t-small text-muted">{t('foundations.notice')}</p>
        </header>

        {/* ── Color ─────────────────────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('foundations.color.title')}</h2>
            <p className="measure text-secondary t-small">{t('foundations.color.body')}</p>
          </div>

          <div className="grid-cards">
            <RoleSwatch token="--color-bg" value="#111c1d" />
            <RoleSwatch token="--color-surface" value="#1d2a2c" />
            <RoleSwatch token="--color-surface-sunken" value="#172324" />
            <RoleSwatch token="--color-text" value="#e7eeef" note="14.8:1" />
            <RoleSwatch token="--color-accent" value="#50b29d" note="6.79:1" />
            <RoleSwatch token="--color-section" value="#063c32" />
          </div>

          <div className="stack stack-8" style={{ marginBlockStart: 'var(--space-12)' }}>
            <Ramp name={t('foundations.color.accentRamp')} role="accent" />
            <Ramp name={t('foundations.color.neutralRamp')} role="neutral" />
          </div>

          <p className="measure t-small text-muted" style={{ marginBlockStart: 'var(--space-8)' }}>
            {t('foundations.color.contrastNote')}
          </p>
        </section>

        {/* ── Typography ────────────────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('foundations.type.title')}</h2>
            <p className="measure text-secondary t-small">{t('foundations.type.body')}</p>
          </div>

          <div className="stack stack-8">
            <div className="stack stack-2">
              <Kicker code>display / 500</Kicker>
              <p className="t-display">{t('foundations.type.displaySample')}</p>
            </div>

            <div className="stack stack-2">
              <Kicker code>heading / 500</Kicker>
              <p className="t-section">{t('foundations.type.headingSample')}</p>
            </div>

            <div className="stack stack-2">
              <Kicker code>body / 400</Kicker>
              <p className="measure">{t('foundations.type.bodySample')}</p>
            </div>

            <div className="stack stack-2">
              <Kicker code>mono / 400</Kicker>
              <CodeBlock>deraya review --repo omar/rag-service</CodeBlock>
            </div>

            {/* Both scripts side by side: the pairing has to hold on one page. */}
            <div className="grid-cards">
              <div className="stack stack-2">
                <Kicker code>ar · IBM Plex Sans Arabic</Kicker>
                <LangRun lang="ar" className="t-title" style={{ display: 'block' }}>
                  مسارات مهنية مبنية على مشاريع حقيقية
                </LangRun>
              </div>
              <div className="stack stack-2">
                <Kicker code>en · Inter</Kicker>
                <LangRun lang="en" className="t-title" style={{ display: 'block' }}>
                  Career tracks built on real projects
                </LangRun>
              </div>
            </div>

            <p className="measure t-small text-muted">{t('foundations.type.arabicNote')}</p>
          </div>
        </section>

        {/* ── Direction ─────────────────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('foundations.direction.title')}</h2>
            <p className="measure text-secondary t-small">{t('foundations.direction.body')}</p>
          </div>

          <div className="grid-2">
            <Card title={t('foundations.direction.mirrorLabel')}>
              <div className="row" style={{ gap: 'var(--space-6)', color: 'var(--color-accent)' }}>
                <ArrowRight size={22} className="mirror-rtl" aria-hidden />
                <CaretRight size={22} className="mirror-rtl" aria-hidden />
                <GitBranch size={22} className="mirror-rtl" aria-hidden />
                <span className="hr" style={{ inlineSize: 60, alignSelf: 'center' }} />
              </div>
              <div
                className="row"
                style={{ gap: 'var(--space-6)', color: 'var(--color-text-muted)' }}
              >
                <Clock size={22} aria-hidden />
                <CheckCircle size={22} aria-hidden />
              </div>
            </Card>

            <Card title={t('foundations.direction.staysLabel')}>
              <div className="stack stack-3">
                <CodeBlock>{`git diff --stat main..feat/rag-eval
 src/retrieval/index.ts | 42 ++++++----
 src/eval/harness.ts    | 18 ++++-`}</CodeBlock>
                <Ltr className="t-mono t-fine">github.com/omar/rag-service/pull/12</Ltr>
                <span className="t-small text-muted">
                  <Num>48</Num> h · <Num>3</Num> files · <Num>12</Num> comments
                </span>
              </div>
            </Card>
          </div>

          <div className="stack stack-3" style={{ marginBlockStart: 'var(--space-8)' }}>
            <Kicker>{t('foundations.direction.mixedLabel')}</Kicker>
            <p className="measure">{t('foundations.direction.mixedSample')}</p>
          </div>
        </section>

        {/* ── Components ────────────────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('foundations.components.title')}</h2>
            <p className="measure text-secondary t-small">{t('foundations.components.body')}</p>
          </div>

          <div className="stack stack-12">
            <div className="stack stack-3">
              <Kicker>{t('foundations.components.buttons')}</Kicker>
              <div className="row">
                <Button variant="primary">{t('cta.startTrack')}</Button>
                <Button variant="secondary">{t('cta.bookReview')}</Button>
                <Button variant="ghost">
                  {t('cta.browseCommunity')}
                  <ArrowRight size={14} className="mirror-rtl" aria-hidden />
                </Button>
                <Button variant="primary" disabled>
                  {t('cta.startTrack')}
                </Button>
              </div>
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.tags')}</Kicker>
              <div className="row">
                <Tag tone="accent">{t('nav.learn')}</Tag>
                <Tag tone="neutral">{t('nav.build')}</Tag>
                <Tag tone="outline">{t('nav.community')}</Tag>
              </div>
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.cards')}</Kicker>
              <div className="grid-cards">
                <Card kicker={t('principles.proof.title')} title={t('hero.supporting.one')}>
                  {t('principles.proof.body')}
                </Card>
                <Card
                  kicker={t('principles.practitioners.title')}
                  title={t('hero.supporting.two')}
                  elevation="md"
                >
                  {t('principles.practitioners.body')}
                </Card>
                <Card kicker={t('principles.arabic.title')} title={t('hero.supporting.three')}>
                  {t('principles.arabic.body')}
                </Card>
              </div>
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.forms')}</Kicker>
              <FormDemo />
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.table')}</Kicker>
              <table className="table">
                <thead>
                  <tr>
                    <th>{t('table.week')}</th>
                    <th>{t('table.topic')}</th>
                    <th>{t('table.output')}</th>
                    <th>{t('table.reviewed')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <Num>01</Num>
                    </td>
                    <td>
                      <Ltr>Retrieval basics</Ltr>
                    </td>
                    <td>
                      <Ltr className="t-mono t-fine">omar/rag-service</Ltr>
                    </td>
                    <td className="text-muted">—</td>
                  </tr>
                  <tr>
                    <td>
                      <Num>02</Num>
                    </td>
                    <td>
                      <Ltr>Evaluation harness</Ltr>
                    </td>
                    <td>
                      <Ltr className="t-mono t-fine">eval/harness.ts</Ltr>
                    </td>
                    <td className="text-muted">—</td>
                  </tr>
                </tbody>
              </table>
              {/* The rows are structure, not content: the track list is open decision 3. */}
              <p className="t-fine text-muted">{t('foundations.placeholder.tableRows')}</p>
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.loading')}</Kicker>
              <div className="stack stack-3" style={{ maxInlineSize: 380 }}>
                <Skeleton width="45%" height="12px" />
                <Skeleton width="85%" height="18px" />
                <Skeleton width="100%" height="46px" />
              </div>
            </div>

            <div className="stack stack-3">
              <Kicker>{t('foundations.components.imagery')}</Kicker>
              <div className="grid-cards">
                <PlaceholderMedia caption={t('foundations.placeholder.photo')} />
                <PlaceholderMedia caption={t('foundations.placeholder.logo')} ratio="3 / 2" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Spacing and elevation ─────────────────────────────────────── */}
        <section className="section rule-top">
          <div className="section-head">
            <h2>{t('foundations.spacing.title')}</h2>
            <p className="measure text-secondary t-small">{t('foundations.spacing.body')}</p>
          </div>

          <div className="stack stack-2">
            {SPACING_STEPS.map((step) => (
              <div key={step} className="row" style={{ gap: 'var(--space-4)', flexWrap: 'nowrap' }}>
                <Ltr className="t-mono t-fine text-muted" style={{ inlineSize: 88, flex: 'none' }}>
                  --space-{step}
                </Ltr>
                <div
                  style={{
                    background: 'var(--color-accent-700)',
                    blockSize: 10,
                    inlineSize: `var(--space-${step})`,
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>
            ))}
          </div>

          <div className="grid-cards" style={{ marginBlockStart: 'var(--space-12)' }}>
            {(['sm', 'md', 'lg'] as const).map((level) => (
              <div key={level} className={`card elev-${level}`}>
                <Ltr className="t-mono t-fine text-muted">--shadow-{level}</Ltr>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
