import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminShell } from '@/components/admin/AdminShell';
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
    <AdminShell>
      <div className="toolbar">
        <h1>{t('services')}</h1>
        <Button href="/admin/services/new" variant="primary">
          {t('newService')}
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="empty-state">
          <p style={{ margin: 0 }}>{t('noServices')}</p>
          <Button href="/admin/services/new" variant="secondary">
            {t('newService')}
          </Button>
        </div>
      ) : (
        <div className="table-scroll">
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
                    <Ltr className="t-mono t-fine text-muted">{service.slug}</Ltr>
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
        </div>
      )}
    </AdminShell>
  );
}
