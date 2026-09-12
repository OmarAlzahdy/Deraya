import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { PlaceholderNote } from '@/components/ui/PlaceholderNote';
import type { Service } from '@/content/services';
import { getPublishedServices } from '@/lib/data/services';
import { pick } from '@/content/types';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services' });
  return { title: t('title'), description: t('intro') };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const services = await getPublishedServices();
  return <Services services={services} />;
}

/**
 * Screen 03 — Services and code review.
 *
 * Written for a buyer, not a learner: shorter lines, no pedagogy, and every
 * service states scope, turnaround and deliverable in that order. Price bands
 * are open decision 4 and render as marked gaps — pricing changes this page's
 * layout, so the slot is built and left visibly empty rather than guessed.
 *
 * No wireframe exists for this screen; the layout is a proposal.
 */
function Services({ services }: { services: Service[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <>
      <a href="#main" className="sr-only">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <header className="stack stack-6">
          <Kicker>{t('services.kicker')}</Kicker>
          <h1 className="measure-tight">{t('services.title')}</h1>
          <p className="t-body text-secondary measure">{t('services.intro')}</p>
        </header>

        <section className="section">
          <div className="stack stack-8">
            {services.length === 0 ? (
              <p className="panel-sunken measure t-small text-muted">{t('services.empty')}</p>
            ) : null}

            {services.map((service) => (
              <article key={service.slug} className="card elev-sm">
                <h2 className="card-title">{pick(service.title, locale)}</h2>

                <dl
                  className="grid"
                  style={{ gap: 'var(--space-6)', margin: 0, marginBlockStart: 'var(--space-3)' }}
                >
                  <div className="stack stack-1">
                    <dt className="t-fine text-muted">{t('services.scopeLabel')}</dt>
                    <dd style={{ margin: 0 }} className="t-small">
                      {pick(service.scope, locale)}
                    </dd>
                  </div>

                  <div className="stack stack-1">
                    <dt className="t-fine text-muted">{t('services.deliverableLabel')}</dt>
                    <dd style={{ margin: 0 }} className="t-small">
                      {pick(service.deliverable, locale)}
                    </dd>
                  </div>

                  <div className="stack stack-1">
                    <dt className="t-fine text-muted">{t('services.turnaroundLabel')}</dt>
                    <dd style={{ margin: 0 }} className="t-small">
                      {pick(service.turnaround, locale)}
                    </dd>
                  </div>

                  <div className="stack stack-1">
                    <dt className="t-fine text-muted">{t('services.priceLabel')}</dt>
                    <dd style={{ margin: 0 }}>
                      {service.priceBand ? (
                        <span className="t-small">
                          {service.priceBand.minMinor / 100}–{service.priceBand.maxMinor / 100}{' '}
                          {service.priceBand.currency}
                        </span>
                      ) : (
                        <PlaceholderNote>{t('placeholder.price')}</PlaceholderNote>
                      )}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          {/* One CTA for the page rather than four that cannot be honoured:
              booking needs auth and a payment path, and neither exists yet. */}
          <div className="row" style={{ marginBlockStart: 'var(--space-12)' }}>
            <Button variant="primary" disabled>
              {t('cta.bookReview')}
            </Button>
            <PlaceholderNote>{t('placeholder.booking')}</PlaceholderNote>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
