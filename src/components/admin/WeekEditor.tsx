'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Num } from '@/components/ui/Bidi';
import type { AdminState } from '@/app/[locale]/admin/actions';
import type { Tables } from '@/lib/supabase/database.types';

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

/** One row of the week-by-week outline. Saves on its own. */
export function WeekEditor({
  week,
  trackId,
  action,
}: {
  week: Tables<'track_weeks'>;
  trackId: string;
  action: Action;
}) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="card elev-sm">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="weekId" value={week.id} />
      <input type="hidden" name="trackId" value={trackId} />

      <div className="row" style={{ gap: 'var(--space-4)' }}>
        <span className="card-kicker">
          {t('week')} <Num>{String(week.week_number).padStart(2, '0')}</Num>
        </span>
        <label className="radio">
          <input type="checkbox" name="reviewed" defaultChecked={week.reviewed} />
          <span>{t('reviewed')}</span>
        </label>
      </div>

      <div className="grid" style={{ marginBlockStart: 'var(--space-3)' }}>
        <Field label={t('titleAr')}>
          {({ id }) => <Input id={id} name="titleAr" lang="ar" defaultValue={week.title_ar} required />}
        </Field>
        <Field label={t('titleEn')}>
          {({ id }) => (
            <Input id={id} name="titleEn" lang="en" ltr defaultValue={week.title_en} required />
          )}
        </Field>
      </div>

      <div className="grid" style={{ marginBlockStart: 'var(--space-3)' }}>
        <Field label={t('outputAr')}>
          {({ id }) => <Input id={id} name="outlineAr" lang="ar" defaultValue={week.outline_ar ?? ''} />}
        </Field>
        <Field label={t('outputEn')}>
          {({ id }) => (
            <Input id={id} name="outlineEn" lang="en" ltr defaultValue={week.outline_en ?? ''} />
          )}
        </Field>
      </div>

      <div className="row" style={{ marginBlockStart: 'var(--space-3)' }}>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? t('saving') : t('save')}
        </Button>
        {state.saved ? <span className="status status-success">{t('saved')}</span> : null}
        {state.error ? (
          <span className="field-message field-message-error">{t('error.failed')}</span>
        ) : null}
      </div>
    </form>
  );
}
