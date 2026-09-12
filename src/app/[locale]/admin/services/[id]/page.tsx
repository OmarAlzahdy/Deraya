import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminShell } from '@/components/admin/AdminShell';
import { Kicker } from '@/components/ui/Kicker';
import { Button } from '@/components/ui/Button';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import { getServiceById } from '@/lib/data/services';
import type { Locale } from '@/i18n/routing';
import { saveService, deleteService } from '../../actions';

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/services/${id}`);
  const service = await getServiceById(id);
  if (!service) notFound();

  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <AdminShell>
      <header className="section-head">
        <Kicker>
          <Link href="/admin/services" style={{ border: 0, color: 'inherit' }}>
            {t('services')}
          </Link>
        </Kicker>
        <h1>{locale === 'ar' ? service.title_ar : service.title_en}</h1>
      </header>

        <ServiceForm service={service} action={saveService} />

      <section className="section-tight">
        <div className="notice" style={{ borderInlineStartColor: 'var(--color-danger)' }}>
          <div className="flow-3">
            <h2 className="t-title">{t('dangerZone')}</h2>
            <p style={{ margin: 0 }}>{t('deleteServiceBody')}</p>
            <form action={deleteService}>
              <input type="hidden" name="id" value={service.id} />
              <input type="hidden" name="locale" value={locale} />
              <Button type="submit" variant="secondary" className="btn-sm">
                {t('deleteService')}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
