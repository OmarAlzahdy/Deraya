import { setRequestLocale, getTranslations } from 'next-intl/server';
import { ChatCircleText } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Button } from '@/components/ui/Button';
import { Kicker } from '@/components/ui/Kicker';
import { Tag } from '@/components/ui/Tag';
import { Num } from '@/components/ui/Bidi';
import { EngineerBadge } from '@/components/community/EngineerBadge';
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
 * The retention layer: threaded questions with engineer answers, tagged by
 * track and topic. A thread holds both languages at once, so the list shows
 * each question in the language it was asked in rather than forcing one.
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
      <SiteHeader />
      <main className="page">
        <header className="stack stack-6">
          <Kicker>{t('kicker')}</Kicker>
          <h1>{t('title')}</h1>
          <p className="t-body text-secondary measure">{t('intro')}</p>
          <div className="row">
            <Button href="/community/ask" variant="primary">
              {t('ask')}
            </Button>
          </div>
        </header>

        {tags.length > 0 ? (
          <nav className="row section" aria-label={t('tags')} style={{ marginBlockStart: 'var(--space-12)' }}>
            <Link href="/community" className="btn btn-ghost">
              {t('allTags')}
            </Link>
            {tags.map((item) => (
              <Link
                key={item.slug}
                href={{ pathname: '/community', query: { tag: item.slug } }}
                className="btn btn-ghost"
                aria-current={tag === item.slug ? 'page' : undefined}
              >
                {locale === 'ar' ? item.label_ar : item.label_en}
              </Link>
            ))}
          </nav>
        ) : null}

        <section className="section stack stack-6">
          {questions.length === 0 ? (
            <p className="panel-sunken measure t-small text-muted">
              {isSupabaseConfigured() ? t('empty') : t('needsDatabase')}
            </p>
          ) : (
            questions.map((question) => (
              <article key={question.id} className="card elev-sm">
                <div className="stack stack-3">
                  <Link
                    href={`/community/${question.id}`}
                    className="card-title"
                    style={{ border: 0, color: 'var(--color-text)' }}
                    lang={question.locale}
                    dir={question.locale === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {question.title}
                  </Link>

                  <div className="row" style={{ gap: 'var(--space-4)' }}>
                    <span className="t-fine text-muted">
                      {question.author?.display_name ?? t('deletedAuthor')}
                    </span>
                    <span className="t-fine text-muted">
                      {formatDate(new Date(question.created_at), locale as Locale)}
                    </span>
                    <span className="t-fine text-muted status status-neutral">
                      <ChatCircleText size={14} aria-hidden />
                      <Num>{question.answerCount}</Num>
                    </span>
                    {question.answered_by_engineer ? <EngineerBadge /> : null}
                  </div>

                  {question.tags.length > 0 ? (
                    <div className="row">
                      {question.tags.map((slug) => (
                        <Tag key={slug} tone="neutral">
                          {slug}
                        </Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
