import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChatCircleText, SealCheck } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { Avatar } from '@/components/ui/Avatar';
import { Num } from '@/components/ui/Bidi';
import { Link } from '@/i18n/navigation';
import { listQuestions, listTags } from '@/lib/data/community';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { formatDate } from '@/i18n/format';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'community' });
  return { title: t('title'), description: t('intro') };
}

/**
 * Screen 06 — Community.
 *
 * A list of threads is a scanning surface, so it is rows rather than cards:
 * title, who and when, answer count, tags. Filters live in the trailing rail
 * where they stay visible while the list scrolls, instead of a strip of pills
 * that pushes the first thread below the fold.
 *
 * Each row carries the language it was asked in. A thread is not translated,
 * so the list shows Arabic titles RTL and English titles LTR, side by side.
 */
export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tag?: string }>;
}) {
  const { locale } = await params;
  const { tag } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'community' });
  const [questions, tags] = await Promise.all([listQuestions(tag), listTags()]);

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <div className="toolbar">
          <div className="section-head" style={{ marginBlockEnd: 0 }}>
            <Kicker>{t('kicker')}</Kicker>
            <h1>{t('title')}</h1>
            <p className="lead">{t('intro')}</p>
          </div>
          <Button href="/community/ask" variant="primary">
            {t('ask')}
          </Button>
        </div>

        <div className="grid-editorial" style={{ marginBlockStart: 'var(--flow-5)' }}>
          <div className="col-content-wide">
            {questions.length === 0 ? (
              <div className="empty-state">
                <p style={{ margin: 0 }}>
                  {isSupabaseConfigured() ? t('empty') : t('needsDatabase')}
                </p>
                {isSupabaseConfigured() ? (
                  <Button href="/community/ask" variant="secondary">
                    {t('ask')}
                  </Button>
                ) : null}
              </div>
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {questions.map((question) => (
                  <li key={question.id} className="list-row">
                    <div className="flow-3">
                      <Link href={`/community/${question.id}`} className="list-row-title">
                        <bdi lang={question.locale} dir={question.locale === 'ar' ? 'rtl' : 'ltr'}>
                          {question.title}
                        </bdi>
                      </Link>

                      <div className="list-row-meta">
                        <span className="row" style={{ gap: 'var(--space-2)' }}>
                          <Avatar
                            name={question.author?.display_name ?? '?'}
                            staff={question.author?.role !== 'member'}
                          />
                          {question.author?.display_name ?? t('deletedAuthor')}
                        </span>
                        <span>{formatDate(new Date(question.created_at), locale as Locale)}</span>
                        {question.tags.map((slug) => (
                          <Link
                            key={slug}
                            href={{ pathname: '/community', query: { tag: slug } }}
                            className="tag tag-neutral"
                            style={{ position: 'relative', zIndex: 1 }}
                          >
                            {slug}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="row" style={{ gap: 'var(--space-3)' }}>
                      {question.answered_by_engineer ? (
                        <span className="count-pill count-pill-answered">
                          <SealCheck size={14} weight="fill" aria-hidden />
                          <span className="sr-only">{t('engineerAnswer')}</span>
                        </span>
                      ) : null}
                      <span className="count-pill" title={t('answersLabel')}>
                        <ChatCircleText size={14} aria-hidden />
                        <Num>{question.answerCount}</Num>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {tags.length > 0 ? (
            <nav className="col-rail col-rail-sticky flow-3" aria-label={t('tags')}>
              <span className="footer-heading" style={{ marginBlockEnd: 0 }}>
                {t('tags')}
              </span>
              <div className="stack stack-1">
                <Link
                  href="/community"
                  className="admin-side-link"
                  aria-current={tag ? undefined : 'page'}
                >
                  {t('allTags')}
                </Link>
                {tags.map((item) => (
                  <Link
                    key={item.slug}
                    href={{ pathname: '/community', query: { tag: item.slug } }}
                    className="admin-side-link"
                    aria-current={tag === item.slug ? 'page' : undefined}
                  >
                    {locale === 'ar' ? item.label_ar : item.label_en}
                  </Link>
                ))}
              </div>
            </nav>
          ) : null}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
