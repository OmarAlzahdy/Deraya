'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Checkbox } from '@/components/ui/Choice';
import type { CommunityState } from '@/app/[locale]/community/actions';
import type { Tables } from '@/lib/supabase/database.types';
import type { Locale } from '@/i18n/routing';

type Action = (state: CommunityState, formData: FormData) => Promise<CommunityState>;

export function AskForm({ action, tags }: { action: Action; tags: Tables<'tags'>[] }) {
  const t = useTranslations('community');
  const locale = useLocale() as Locale;
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="stack stack-6" style={{ maxInlineSize: '640px' }}>
      <input type="hidden" name="locale" value={locale} />

      <Field label={t('questionTitle')}>
        {({ id }) => <Input id={id} name="title" required minLength={8} />}
      </Field>

      <Field label={t('questionBody')} hint={t('codeHint')}>
        {({ id }) => <Textarea id={id} name="body" rows={10} required minLength={20} />}
      </Field>

      {tags.length > 0 ? (
        <fieldset className="stack stack-3" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="t-fine text-muted" style={{ padding: 0 }}>
            {t('tags')}
          </legend>
          <div className="row">
            {tags.map((tag) => (
              <Checkbox key={tag.slug} name="tags" value={tag.slug}>
                {locale === 'ar' ? tag.label_ar : tag.label_en}
              </Checkbox>
            ))}
          </div>
        </fieldset>
      ) : null}

      {state.error ? (
        <p className="field-message field-message-error" role="alert">
          {t(`error.${state.error}` as 'error.failed')}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? t('posting') : t('ask')}
      </Button>
    </form>
  );
}
