'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Textarea } from '@/components/ui/Field';
import type { CommunityState } from '@/app/[locale]/community/actions';

type Action = (state: CommunityState, formData: FormData) => Promise<CommunityState>;

export function AnswerForm({
  action,
  questionId,
  locale,
}: {
  action: Action;
  questionId: string;
  locale: string;
}) {
  const t = useTranslations('community');
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="stack stack-4">
      <input type="hidden" name="questionId" value={questionId} />
      <input type="hidden" name="locale" value={locale} />

      <Field label={t('yourAnswer')} hint={t('codeHint')}>
        {({ id }) => <Textarea id={id} name="body" rows={6} required />}
      </Field>

      {state.error ? (
        <p className="field-message field-message-error" role="alert">
          {t(`error.${state.error}` as 'error.failed')}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? t('posting') : t('postAnswer')}
      </Button>
    </form>
  );
}
