import { setRequestLocale, getTranslations } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { TrackCard } from '@/components/TrackCard';
import { Kicker } from '@/components/ui/Kicker';
import { getPublishedTracks } from '@/lib/data/tracks';
import type { Track } from '@/content/tracks';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'tracks' });
  return { title: t('title'), description: t('intro') };
}

export default async function TracksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tracks = await getPublishedTracks();
  return <Tracks tracks={tracks} />;
}

/** The index the Learn engine points at. */
function Tracks({ tracks }: { tracks: Track[] }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('nav.skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <header className="section-head">
          <Kicker>{t('tracks.kicker')}</Kicker>
          <h1>{t('tracks.title')}</h1>
          <p className="lead">{t('tracks.intro')}</p>
        </header>

        {tracks.length === 0 ? (
          <p className="empty-state">{t('tracks.empty')}</p>
        ) : (
          <div className="grid-cards">
            {tracks.map((track) => (
              <TrackCard key={track.slug} track={track} locale={locale} />
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
