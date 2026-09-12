import { setRequestLocale, getTranslations } from 'next-intl/server';
import { AdminShell } from '@/components/admin/AdminShell';
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
    <AdminShell>
      <div className="toolbar">
        <h1>{t('courses')}</h1>
        <Button href="/admin/tracks/new" variant="primary">
          {t('newCourse')}
        </Button>
      </div>

      {tracks.length === 0 ? (
        <div className="empty-state">
          <p style={{ margin: 0 }}>{t('noCourses')}</p>
          <Button href="/admin/tracks/new" variant="secondary">
            {t('newCourse')}
          </Button>
        </div>
      ) : (
        <div className="table-scroll">
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
                    <Ltr className="t-mono t-fine text-muted">{track.slug}</Ltr>
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
        </div>
      )}
    </AdminShell>
  );
}
