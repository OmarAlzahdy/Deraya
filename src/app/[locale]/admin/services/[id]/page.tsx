import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
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
    <>
      <SiteHeader />
      <main className="page stack stack-12">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/admin/services" style={{ border: 0, color: 'inherit' }}>
              {t('services')}
            </Link>
          </Kicker>
          <h1>{locale === 'ar' ? service.title_ar : service.title_en}</h1>
        </header>

        <ServiceForm service={service} action={saveService} />

        <section className="stack stack-4 rule-top" style={{ paddingBlockStart: 'var(--space-12)' }}>
          <h2 className="t-title">{t('dangerZone')}</h2>
          <p className="t-small text-muted measure">{t('deleteServiceBody')}</p>
          <form action={deleteService}>
            <input type="hidden" name="id" value={service.id} />
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="secondary">
              {t('deleteService')}
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
