import { redirect } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

/**
 * Home is screen 01 and has no approved layout yet (handoff: open decision 6,
 * and the track list, prices and team it depends on — decisions 3, 4 and 5).
 * Until those land, the root sends visitors to the foundations reference so
 * this route stays free for the real Home rather than being squatted on by a
 * placeholder that would have to be torn out.
 */
export default async function LocaleRoot({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: '/system', locale });
}
