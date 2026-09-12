import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import type { Locale } from '@/i18n/routing';
import { saveService } from '../../actions';

export default async function NewServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/services/new`);
  const t = await getTranslations({ locale, namespace: 'admin' });

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/admin/services" style={{ border: 0, color: 'inherit' }}>
              {t('services')}
            </Link>
          </Kicker>
          <h1>{t('newService')}</h1>
        </header>

        <ServiceForm action={saveService} />
      </main>
    </>
  );
}
