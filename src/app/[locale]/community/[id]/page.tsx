import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { CheckCircle } from '@phosphor-icons/react/dist/ssr';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { Kicker } from '@/components/ui/Kicker';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
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
 * Mixed direction is the normal case here, not an edge case: the question may
 * be Arabic and an answer English, with code in both. Each body carries its
 * own `lang`/`dir`, and fenced code inside any of them renders as an LTR
 * island (see RichText).
 *
 * Answers are a threaded list with the author on a leading rail, not a stack
 * of cards — a card per answer makes a conversation read as a set of unrelated
 * objects. The accepted answer leads and is marked on its leading edge.
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
  const questionDir = question.locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <a href="#main" className="sr-only skip-link">
        {t('skipToContent')}
      </a>
      <SiteHeader />

      <main id="main" className="page">
        <div className="grid-editorial">
          <div className="col-content-wide">
            <header className="flow-4">
              <Kicker>
                <Link href="/community" style={{ border: 0, color: 'inherit' }}>
                  {t('kicker')}
                </Link>
              </Kicker>

              <h1 className="measure-tight">
                <bdi lang={question.locale} dir={questionDir}>
                  {question.title}
                </bdi>
              </h1>

              <div className="row row-4">
                <span className="row" style={{ gap: 'var(--space-3)' }}>
                  <Avatar
                    name={question.author?.display_name ?? '?'}
                    staff={question.author?.role !== 'member'}
                  />
                  <span className="t-small">
                    {question.author?.display_name ?? t('deletedAuthor')}
                  </span>
                </span>
                <span className="t-fine text-muted">
                  {formatDate(new Date(question.created_at), locale as Locale)}
                </span>
                {question.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={{ pathname: '/community', query: { tag: tag.slug } }}
                    className="tag tag-neutral"
                  >
                    {locale === 'ar' ? tag.label_ar : tag.label_en}
                  </Link>
                ))}
              </div>
            </header>

            <div
              className="t-body"
              lang={question.locale}
              dir={questionDir}
              style={{ marginBlockStart: 'var(--flow-5)' }}
            >
              <RichText body={question.body} />
            </div>

            {/* ── Answers ────────────────────────────────────────────── */}
            <section className="section-tight">
              <div className="section-divider">
                <h2 className="t-section">{t('answers', { count: question.answers.length })}</h2>
              </div>

              <div>
                {question.answers.map((answer) => (
                  <article
                    key={answer.id}
                    className={['thread-item', answer.accepted_at ? 'thread-accepted' : null]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <Avatar
                      name={answer.author?.display_name ?? '?'}
                      size="lg"
                      staff={answeredByEngineer(answer)}
                    />

                    <div className="flow-3">
                      <div className="row row-4">
                        <span className="t-small">
                          {answer.author?.display_name ?? t('deletedAuthor')}
                        </span>
                        {answeredByEngineer(answer) ? <EngineerBadge /> : null}
                        {answer.accepted_at ? (
                          <span className="status status-success t-fine">
                            <CheckCircle size={15} weight="fill" aria-hidden />
                            <span>{t('accepted')}</span>
                          </span>
                        ) : null}
                        <span className="t-fine text-muted">
                          {formatDate(new Date(answer.created_at), locale as Locale)}
                        </span>
                      </div>

                      {/* An answer carries no stored language — a thread mixes
                          them freely. `dir="auto"` reads the first strong
                          character, so an English answer in an Arabic thread
                          sets left-to-right and keeps its full stop at the end. */}
                      <div className="t-body" dir="auto">
                        <RichText body={answer.body} />
                      </div>

                      {isAuthor && !answer.accepted_at ? (
                        <form action={acceptAnswer}>
                          <input type="hidden" name="answerId" value={answer.id} />
                          <input type="hidden" name="questionId" value={question.id} />
                          <input type="hidden" name="locale" value={locale} />
                          <Button type="submit" variant="ghost" className="btn-sm">
                            {t('accept')}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Reply ─────────────────────────────────────────────── */}
            <section className="section-tight">
              {profile ? (
                <div className="panel">
                  <AnswerForm action={postAnswer} questionId={question.id} locale={locale} />
                </div>
              ) : (
                <div className="empty-state">
                  <p style={{ margin: 0 }}>{t('signInToAnswer')}</p>
                  <Button href="/sign-in" variant="primary">
                    {t('signIn')}
                  </Button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
