import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { Clock } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { Num } from '@/components/ui/Bidi';
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
 * Written for a buyer, not a learner: shorter lines, no pedagogy, and the two
 * things a buyer scans for — turnaround and price — pulled out of the prose
 * into a fixed position on every card, so four services can be compared down
 * the page rather than read one by one.
 */
function Services({ services }: { services: Service[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <header className="section-head">
          <Kicker>{t('services.kicker')}</Kicker>
          <h1>{t('services.title')}</h1>
          <p className="lead">{t('services.intro')}</p>
        </header>

        <div className="flow-4">
          {services.length === 0 ? <p className="empty-state">{t('services.empty')}</p> : null}

          {services.map((service) => (
            <article key={service.slug} className="card" style={{ padding: 'var(--space-12)' }}>
              <div className="grid-editorial" style={{ gap: 'var(--space-8) var(--space-16)' }}>
                <div className="col-content-wide flow-4">
                  <h2 className="t-subsection">{pick(service.title, locale)}</h2>

                  <div className="grid-pair" style={{ gap: 'var(--space-6) var(--space-12)' }}>
                    <div className="flow-1">
                      <span className="t-fine text-muted">{t('services.scopeLabel')}</span>
                      <p className="t-small">{pick(service.scope, locale)}</p>
                    </div>
                    <div className="flow-1">
                      <span className="t-fine text-muted">{t('services.deliverableLabel')}</span>
                      <p className="t-small">{pick(service.deliverable, locale)}</p>
                    </div>
                  </div>
                </div>

                {/* The two facts a buyer compares, in the same place on every
                    card so the eye can run down them. */}
                <div className="col-rail flow-4">
                  <div className="flow-1">
                    <span className="t-fine text-muted">{t('services.turnaroundLabel')}</span>
                    <span className="status status-neutral">
                      <Clock size={15} aria-hidden />
                      <span className="t-small" style={{ color: 'var(--color-text)' }}>
                        {pick(service.turnaround, locale)}
                      </span>
                    </span>
                  </div>

                  <div className="flow-1">
                    <span className="t-fine text-muted">{t('services.priceLabel')}</span>
                    {service.priceBand ? (
                      <span className="t-subsection">
                        <Num>{service.priceBand.minMinor / 100}</Num>–
                        <Num>{service.priceBand.maxMinor / 100}</Num>{' '}
                        <span className="t-small text-muted">{service.priceBand.currency}</span>
                      </span>
                    ) : (
                      <PlaceholderNote>{t('placeholder.price')}</PlaceholderNote>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* One CTA for the page rather than four that cannot be honoured:
            booking needs auth and a payment path, and neither exists yet. */}
        <div className="row row-4 section-tight">
          <Button variant="primary" className="btn-lg" disabled>
            {t('cta.bookReview')}
          </Button>
          <PlaceholderNote>{t('placeholder.booking')}</PlaceholderNote>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
