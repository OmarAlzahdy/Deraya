import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Ltr } from '@/components/ui/Bidi';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAllServices } from '@/lib/data/services';
import type { Locale } from '@/i18n/routing';

export default async function AdminServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/services`);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const services = await getAllServices();

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/admin" style={{ border: 0, color: 'inherit' }}>
              {t('kicker')}
            </Link>
          </Kicker>
          <h1>{t('services')}</h1>
          <div className="row">
            <Button href="/admin/services/new" variant="primary">
              {t('newService')}
            </Button>
          </div>
        </header>

        {services.length === 0 ? (
          <p className="panel-sunken measure t-small text-muted">{t('noServices')}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('titleEn')}</th>
                <th>{t('slug')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <Link href={`/admin/services/${service.id}`}>
                      {locale === 'ar' ? service.title_ar : service.title_en}
                    </Link>
                  </td>
                  <td>
                    <Ltr className="t-mono t-fine">{service.slug}</Ltr>
                  </td>
                  <td>
                    <Tag tone={service.status === 'published' ? 'accent' : 'neutral'}>
                      {t(service.status as 'draft')}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
