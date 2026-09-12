'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth';
import { routing, type Locale } from '@/i18n/routing';

export type CommunityState = { error?: string };

/** Textareas post CRLF; bodies are stored with plain newlines. */
function body(formData: FormData, name: string) {
  return String(formData.get(name) ?? '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function readLocale(formData: FormData): Locale {
  const value = String(formData.get('locale') ?? '');
  return routing.locales.includes(value as Locale) ? (value as Locale) : routing.defaultLocale;
}

export async function askQuestion(
  _prev: CommunityState,
  formData: FormData,
): Promise<CommunityState> {
  const profile = await getProfile();
  if (!profile) return { error: 'signedOut' };

  const locale = readLocale(formData);
  const title = String(formData.get('title') ?? '').trim();
  const questionBody = body(formData, 'body');
  const tags = formData.getAll('tags').map(String).filter(Boolean).slice(0, 4);

  if (title.length < 8) return { error: 'title' };
  if (questionBody.length < 20) return { error: 'body' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('questions')
    .insert({ author_id: profile.id, title, body: questionBody, locale })
    .select('id')
    .single();

  if (error || !data) return { error: 'failed' };

  if (tags.length > 0) {
    await supabase
      .from('question_tags')
      .insert(tags.map((tag) => ({ question_id: data.id, tag_slug: tag })));
  }

  revalidatePath(`/${locale}/community`);
  redirect(`/${locale}/community/${data.id}` as Route);
}

export async function postAnswer(
  _prev: CommunityState,
  formData: FormData,
): Promise<CommunityState> {
  const profile = await getProfile();
  if (!profile) return { error: 'signedOut' };

  const locale = readLocale(formData);
  const questionId = String(formData.get('questionId') ?? '');
  const answerBody = body(formData, 'body');

  if (answerBody.length < 10) return { error: 'body' };

  const supabase = await createClient();
  // `authored_as` is deliberately not sent: a trigger stamps it from the
  // author's real role, which is what the engineer badge reads.
  const { error } = await supabase
    .from('answers')
    .insert({ question_id: questionId, author_id: profile.id, body: answerBody });

  if (error) return { error: 'failed' };

  revalidatePath(`/${locale}/community/${questionId}`);
  return {};
}

/** Only the person who asked can mark an answer as the one that worked. */
export async function acceptAnswer(formData: FormData) {
  const profile = await getProfile();
  if (!profile) return;

  const locale = readLocale(formData);
  const answerId = String(formData.get('answerId') ?? '');
  const questionId = String(formData.get('questionId') ?? '');

  const supabase = await createClient();
  const { data: question } = await supabase
    .from('questions')
    .select('author_id')
    .eq('id', questionId)
    .maybeSingle();

  if (!question || question.author_id !== profile.id) return;

  // One accepted answer per thread.
  await supabase.from('answers').update({ accepted_at: null }).eq('question_id', questionId);
  await supabase
    .from('answers')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', answerId);

  revalidatePath(`/${locale}/community/${questionId}`);
}
