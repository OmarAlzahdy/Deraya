import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import type { Tables } from '@/lib/supabase/database.types';

/**
 * The community layer: threaded questions with engineer answers, tagged by
 * track and topic.
 *
 * Author profiles are embedded through the named foreign key rather than a
 * second round trip, and the engineer badge reads `authored_as` — the role
 * stamped on the answer by a database trigger at write time, not a role the
 * client sent and not the author's role today.
 */

export type QuestionAuthor = Pick<Tables<'profiles'>, 'handle' | 'display_name' | 'role'>;

export type QuestionSummary = Tables<'questions'> & {
  author: QuestionAuthor | null;
  answerCount: number;
  tags: string[];
};

export type Answer = Tables<'answers'> & { author: QuestionAuthor | null };

export type QuestionThread = Tables<'questions'> & {
  author: QuestionAuthor | null;
  answers: Answer[];
  tags: Tables<'tags'>[];
};

const AUTHOR = 'profiles!questions_author_id_fkey(handle, display_name, role)';
const ANSWER_AUTHOR = 'profiles!answers_author_id_fkey(handle, display_name, role)';

export async function listQuestions(tag?: string): Promise<QuestionSummary[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  let query = supabase
    .from('questions')
    .select(`*, ${AUTHOR}, answers(count), question_tags(tag_slug)`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (tag) {
    // Filter through the join table rather than fetching and filtering here.
    const { data: tagged } = await supabase
      .from('question_tags')
      .select('question_id')
      .eq('tag_slug', tag);
    const ids = (tagged ?? []).map((row) => row.question_id);
    if (ids.length === 0) return [];
    query = query.in('id', ids);
  }

  const { data } = await query;

  return (data ?? []).map((row) => {
    const { profiles, answers, question_tags: questionTags, ...question } = row as never as {
      profiles: QuestionAuthor | null;
      answers: { count: number }[];
      question_tags: { tag_slug: string }[];
    } & Tables<'questions'>;

    return {
      ...question,
      author: profiles,
      answerCount: answers?.[0]?.count ?? 0,
      tags: (questionTags ?? []).map((t) => t.tag_slug),
    };
  });
}

export async function getQuestion(id: string): Promise<QuestionThread | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('questions')
    .select(`*, ${AUTHOR}, answers(*, ${ANSWER_AUTHOR}), question_tags(tags(*))`)
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;

  const { profiles, answers, question_tags: questionTags, ...question } = data as never as {
    profiles: QuestionAuthor | null;
    answers: (Tables<'answers'> & { profiles: QuestionAuthor | null })[];
    question_tags: { tags: Tables<'tags'> | null }[];
  } & Tables<'questions'>;

  return {
    ...question,
    author: profiles,
    answers: (answers ?? [])
      .map(({ profiles: answerAuthor, ...answer }) => ({ ...answer, author: answerAuthor }))
      .sort((a, b) => {
        // An accepted answer leads the thread; the rest run oldest first.
        if (Boolean(a.accepted_at) !== Boolean(b.accepted_at)) return a.accepted_at ? -1 : 1;
        return a.created_at.localeCompare(b.created_at);
      }),
    tags: (questionTags ?? []).map((row) => row.tags).filter((tag): tag is Tables<'tags'> => !!tag),
  };
}

export async function listTags(): Promise<Tables<'tags'>[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from('tags').select('*').order('slug');
  return data ?? [];
}

/** The badge is a claim about who is speaking, so it reads the stamped role. */
export function answeredByEngineer(answer: Pick<Tables<'answers'>, 'authored_as'>) {
  return ['engineer', 'instructor', 'admin'].includes(answer.authored_as);
}
