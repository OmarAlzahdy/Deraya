import { setRequestLocale, getTranslations } from 'next-intl/server';
import { SiteHeader } from '@/components/SiteHeader';
import { Kicker } from '@/components/ui/Kicker';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Ltr, Num } from '@/components/ui/Bidi';
import { Link } from '@/i18n/navigation';
import { requireAdmin } from '@/lib/auth';
import { getAllTracks } from '@/lib/data/tracks';
import type { Locale } from '@/i18n/routing';

export default async function AdminTracksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requireAdmin(locale as Locale, `/${locale}/admin/tracks`);
  const t = await getTranslations({ locale, namespace: 'admin' });
  const tracks = await getAllTracks();

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
          <h1>{t('courses')}</h1>
          <div className="row">
            <Button href="/admin/tracks/new" variant="primary">
              {t('newCourse')}
            </Button>
          </div>
        </header>

        {tracks.length === 0 ? (
          <p className="panel-sunken measure t-small text-muted">{t('noCourses')}</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>{t('titleEn')}</th>
                <th>{t('slug')}</th>
                <th>{t('weekCount')}</th>
                <th>{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track) => (
                <tr key={track.id}>
                  <td>
                    <Link href={`/admin/tracks/${track.id}`}>
                      {locale === 'ar' ? track.title_ar : track.title_en}
                    </Link>
                  </td>
                  <td>
                    <Ltr className="t-mono t-fine">{track.slug}</Ltr>
                  </td>
                  <td>
                    <Num>{track.week_count}</Num>
                  </td>
                  <td>
                    <Tag tone={track.status === 'published' ? 'accent' : 'neutral'}>
                      {t(track.status as 'draft')}
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
