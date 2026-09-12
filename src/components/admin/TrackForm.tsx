'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Seg, SegOption } from '@/components/ui/Choice';
import type { AdminState } from '@/app/[locale]/admin/actions';
import type { Tables } from '@/lib/supabase/database.types';

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

/**
 * Course editor. Both languages sit side by side in the same form rather than
 * behind a language toggle: a row is only publishable with both filled in, and
 * putting them next to each other is what makes a missing one obvious.
 */
export function TrackForm({ track, action }: { track?: Tables<'tracks'>; action: Action }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="stack stack-8">
      <input type="hidden" name="locale" value={locale} />
      {track ? <input type="hidden" name="id" value={track.id} /> : null}

      <div className="grid">
        <Field label={t('slug')} hint={t('slugHint')}>
          {({ id }) => <Input id={id} name="slug" defaultValue={track?.slug ?? ''} ltr required />}
        </Field>
        <Field label={t('weekCount')}>
          {({ id }) => (
            <Input
              id={id}
              name="weekCount"
              type="number"
              min={1}
              max={52}
              defaultValue={track?.week_count ?? 12}
              ltr
              required
            />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('titleAr')}>
          {({ id }) => (
            <Input id={id} name="titleAr" lang="ar" defaultValue={track?.title_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('titleEn')}>
          {({ id }) => (
            <Input id={id} name="titleEn" lang="en" ltr defaultValue={track?.title_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('summaryAr')}>
          {({ id }) => (
            <Textarea id={id} name="summaryAr" lang="ar" rows={4} defaultValue={track?.summary_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('summaryEn')}>
          {({ id }) => (
            <Textarea id={id} name="summaryEn" lang="en" rows={4} defaultValue={track?.summary_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('outcomeAr')} hint={t('outcomeHint')}>
          {({ id }) => (
            <Textarea id={id} name="outcomeAr" lang="ar" rows={2} defaultValue={track?.outcome_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('outcomeEn')} hint={t('outcomeHint')}>
          {({ id }) => (
            <Textarea id={id} name="outcomeEn" lang="en" rows={2} defaultValue={track?.outcome_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('prerequisitesAr')}>
          {({ id }) => (
            <Textarea id={id} name="prerequisitesAr" lang="ar" rows={2} defaultValue={track?.prerequisites_ar ?? ''} />
          )}
        </Field>
        <Field label={t('prerequisitesEn')}>
          {({ id }) => (
            <Textarea id={id} name="prerequisitesEn" lang="en" rows={2} defaultValue={track?.prerequisites_en ?? ''} />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('price')} hint={t('priceHint')}>
          {({ id }) => (
            <Input
              id={id}
              name="price"
              type="number"
              min={0}
              step="1"
              ltr
              defaultValue={track?.price_minor != null ? track.price_minor / 100 : ''}
            />
          )}
        </Field>
        <Field label={t('currency')}>
          {({ id }) => <Input id={id} name="currency" ltr defaultValue={track?.currency ?? 'SAR'} />}
        </Field>
        <Field label={t('position')}>
          {({ id }) => (
            <Input id={id} name="position" type="number" ltr defaultValue={track?.position ?? 0} />
          )}
        </Field>
      </div>

      <div className="stack stack-3">
        <span className="t-fine text-muted">{t('status')}</span>
        <Seg label={t('status')}>
          <SegOption name="status" value="draft" defaultChecked={(track?.status ?? 'draft') === 'draft'}>
            {t('draft')}
          </SegOption>
          <SegOption name="status" value="published" defaultChecked={track?.status === 'published'}>
            {t('published')}
          </SegOption>
          <SegOption name="status" value="archived" defaultChecked={track?.status === 'archived'}>
            {t('archived')}
          </SegOption>
        </Seg>
      </div>

      {state.error ? (
        <p className="field-message field-message-error" role="alert">
          {t(`error.${state.error}` as 'error.failed')}
        </p>
      ) : null}
      {state.saved ? (
        <p className="status status-success" role="status">
          {t('saved')}
        </p>
      ) : null}

      <div className="row">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? t('saving') : track ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}
