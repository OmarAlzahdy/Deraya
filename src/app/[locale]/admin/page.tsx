import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import { AdminShell } from '@/components/admin/AdminShell';
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
 * The admin overview: what is published, out of what exists.
 *
 * Guarded three times over — this page checks the role, every action re-checks
 * it on the server, and RLS would refuse the write regardless. A member who is
 * not an admin gets a 404 rather than a "forbidden": the routes do not
 * advertise themselves.
 */
export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin`);
  const t = await getTranslations({ locale, namespace: 'admin' });

  const [tracks, services] = await Promise.all([getAllTracks(), getAllServices()]);
  const published = {
    tracks: tracks.filter((track) => track.status === 'published').length,
    services: services.filter((service) => service.status === 'published').length,
  };

  return (
    <AdminShell>
      <header className="section-head">
        <h1>{t('title')}</h1>
        <p className="lead">{t('intro')}</p>
      </header>

      <div className="grid-2">
        <article className="card flow-4">
          <div className="card-kicker">{t('courses')}</div>
          <div className="stat">
            <span className="stat-value t-section">
              <Num>{published.tracks}</Num>
              <span className="text-muted"> / </span>
              <Num>{tracks.length}</Num>
            </span>
            <span className="stat-label">{t('publishedOfTotal')}</span>
          </div>
          <p className="card-body">{t('coursesBody')}</p>
          <div className="actions">
            <Button href="/admin/tracks" variant="primary">
              {t('manageCourses')}
              <ArrowRight size={14} className="mirror-rtl" aria-hidden />
            </Button>
          </div>
        </article>

        <article className="card flow-4">
          <div className="card-kicker">{t('services')}</div>
          <div className="stat">
            <span className="stat-value t-section">
              <Num>{published.services}</Num>
              <span className="text-muted"> / </span>
              <Num>{services.length}</Num>
            </span>
            <span className="stat-label">{t('publishedOfTotal')}</span>
          </div>
          <p className="card-body">{t('servicesBody')}</p>
          <div className="actions">
            <Button href="/admin/services" variant="primary">
              {t('manageServices')}
              <ArrowRight size={14} className="mirror-rtl" aria-hidden />
            </Button>
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
