import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Num } from '@/components/ui/Bidi';
import { requireAdmin } from '@/lib/auth';
import { getAllTracks } from '@/lib/data/tracks';
import { getAllServices } from '@/lib/data/services';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  return { title: t('title') };
}

/**
 * The admin area. Guarded three times over: this page checks the role, every
 * action re-checks it on the server, and the RLS policies would refuse the
 * write regardless. A member who is not an admin gets a 404 here rather than a
 * "forbidden" — the routes do not advertise themselves.
 */
export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin`);
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [tracks, services] = await Promise.all([getAllTracks(), getAllServices()]);
  const publishedTracks = tracks.filter((track) => track.status === 'published').length;
  const publishedServices = services.filter((service) => service.status === 'published').length;

  return (
    <>
      <SiteHeader />
      <main className="page stack stack-8">
        <header className="stack stack-4">
          <Kicker>{t('kicker')}</Kicker>
          <h1>{t('title')}</h1>
          <p className="t-small text-secondary measure">{t('intro')}</p>
        </header>

        <div className="grid">
          <Card
            kicker={t('courses')}
            title={
              <>
                <Num>{publishedTracks}</Num> / <Num>{tracks.length}</Num>
              </>
            }
          >
            <div className="stack stack-4">
              <p style={{ margin: 0 }}>{t('coursesBody')}</p>
              <Button href="/admin/tracks" variant="primary" style={{ alignSelf: 'flex-start' }}>
                {t('manageCourses')}
              </Button>
            </div>
          </Card>

          <Card
            kicker={t('services')}
            title={
              <>
                <Num>{publishedServices}</Num> / <Num>{services.length}</Num>
              </>
            }
          >
            <div className="stack stack-4">
              <p style={{ margin: 0 }}>{t('servicesBody')}</p>
              <Button href="/admin/services" variant="primary" style={{ alignSelf: 'flex-start' }}>
                {t('manageServices')}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
