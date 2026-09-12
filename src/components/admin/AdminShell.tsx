import { getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { AdminNav } from './AdminNav';

/**
 * The admin is a working surface, not a reading one: a persistent side
 * navigation, a dense content area, and no footer — nobody browsing the
 * marketing site arrives here, and nobody editing a course wants a site map
 * under it.
 */
export async function AdminShell({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('admin');

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <div className="admin-layout">
          <AdminNav
            labels={{
              overview: t('kicker'),
              courses: t('courses'),
              services: t('services'),
            }}
          />
          <div>{children}</div>
        </div>
      </main>
    </>
  );
}
