import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Kicker } from '@/components/ui/Kicker';
import { Tag } from '@/components/ui/Tag';
import { Button } from '@/components/ui/Button';
import { RichText } from '@/components/community/RichText';
import { EngineerBadge } from '@/components/community/EngineerBadge';
import { AnswerForm } from '@/components/community/AnswerForm';
import { Link } from '@/i18n/navigation';
import { getQuestion, answeredByEngineer } from '@/lib/data/community';
import { getProfile } from '@/lib/auth';
import { formatDate } from '@/i18n/format';
import type { Locale } from '@/i18n/routing';
import { postAnswer, acceptAnswer } from '../actions';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await getQuestion(id);
  return { title: question?.title };
}

/**
 * A thread.
 *
 * Mixed direction in one page is the normal case here, not an edge case: the
 * question may be Arabic and an answer English, with code in both. Each body
 * carries its own `lang`/`dir`, and fenced code inside any of them renders as
 * an LTR island (see RichText).
 */
export default async function ThreadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [question, profile] = await Promise.all([getQuestion(id), getProfile()]);
  if (!question) notFound();

  const t = await getTranslations({ locale, namespace: 'community' });
  const isAuthor = profile?.id === question.author_id;

  return (
    <>
      <SiteHeader />
      <main className="page">
        <header className="stack stack-4">
          <Kicker>
            <Link href="/community" style={{ border: 0, color: 'inherit' }}>
              {t('kicker')}
            </Link>
          </Kicker>

          <h1 lang={question.locale} dir={question.locale === 'ar' ? 'rtl' : 'ltr'}>
            {question.title}
          </h1>

          <div className="row" style={{ gap: 'var(--space-4)' }}>
            <span className="t-fine text-muted">
              {question.author?.display_name ?? t('deletedAuthor')}
            </span>
            <span className="t-fine text-muted">
              {formatDate(new Date(question.created_at), locale as Locale)}
            </span>
          </div>

          {question.tags.length > 0 ? (
            <div className="row">
              {question.tags.map((tag) => (
                <Tag key={tag.slug} tone="neutral">
                  {locale === 'ar' ? tag.label_ar : tag.label_en}
                </Tag>
              ))}
            </div>
          ) : null}
        </header>

        <section
          className="section"
          lang={question.locale}
          dir={question.locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <RichText body={question.body} />
        </section>

        <section className="section rule-top stack stack-8">
          <h2 className="t-section">
            {t('answers', { count: question.answers.length })}
          </h2>

          {question.answers.map((answer) => (
            <article
              key={answer.id}
              className="card elev-sm"
              style={
                answer.accepted_at
                  ? { borderInlineStart: '2px solid var(--color-accent)' }
                  : undefined
              }
            >
              <div className="row" style={{ gap: 'var(--space-4)' }}>
                <span className="t-small">{answer.author?.display_name ?? t('deletedAuthor')}</span>
                {answeredByEngineer(answer) ? <EngineerBadge /> : null}
                {answer.accepted_at ? (
                  <span className="status status-success">
                    <CheckCircle size={15} aria-hidden />
                    <span>{t('accepted')}</span>
                  </span>
                ) : null}
                <span className="t-fine text-muted">
                  {formatDate(new Date(answer.created_at), locale as Locale)}
                </span>
              </div>

              <div style={{ marginBlockStart: 'var(--space-3)' }}>
                <RichText body={answer.body} />
              </div>

              {isAuthor && !answer.accepted_at ? (
                <form action={acceptAnswer} style={{ marginBlockStart: 'var(--space-3)' }}>
                  <input type="hidden" name="answerId" value={answer.id} />
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="locale" value={locale} />
                  <Button type="submit" variant="ghost">
                    {t('accept')}
                  </Button>
                </form>
              ) : null}
            </article>
          ))}

          {profile ? (
            <AnswerForm action={postAnswer} questionId={question.id} locale={locale} />
          ) : (
            <p className="panel-sunken t-small text-muted measure">
              {t('signInToAnswer')} <Link href="/sign-in">{t('signIn')}</Link>
            </p>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
