'use client';

import { useActionState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Field';
import { Seg, SegOption } from '@/components/ui/Choice';
import type { AdminState } from '@/app/[locale]/admin/actions';
import type { Tables } from '@/lib/supabase/database.types';

type Action = (state: AdminState, formData: FormData) => Promise<AdminState>;

/** Service editor. Price is a band, because that is how the brief sells it. */
export function ServiceForm({ service, action }: { service?: Tables<'services'>; action: Action }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="stack stack-8">
      <input type="hidden" name="locale" value={locale} />
      {service ? <input type="hidden" name="id" value={service.id} /> : null}

      <div className="grid">
        <Field label={t('slug')} hint={t('slugHint')}>
          {({ id }) => <Input id={id} name="slug" defaultValue={service?.slug ?? ''} ltr required />}
        </Field>
        <Field label={t('turnaroundDays')} hint={t('turnaroundHint')}>
          {({ id }) => (
            <Input
              id={id}
              name="turnaroundDays"
              type="number"
              min={0}
              ltr
              defaultValue={service?.turnaround_days ?? ''}
            />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('titleAr')}>
          {({ id }) => (
            <Input id={id} name="titleAr" lang="ar" defaultValue={service?.title_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('titleEn')}>
          {({ id }) => (
            <Input id={id} name="titleEn" lang="en" ltr defaultValue={service?.title_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('scopeAr')}>
          {({ id }) => (
            <Textarea id={id} name="scopeAr" lang="ar" rows={3} defaultValue={service?.scope_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('scopeEn')}>
          {({ id }) => (
            <Textarea id={id} name="scopeEn" lang="en" rows={3} defaultValue={service?.scope_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('deliverableAr')}>
          {({ id }) => (
            <Textarea id={id} name="deliverableAr" lang="ar" rows={3} defaultValue={service?.deliverable_ar ?? ''} required />
          )}
        </Field>
        <Field label={t('deliverableEn')}>
          {({ id }) => (
            <Textarea id={id} name="deliverableEn" lang="en" rows={3} defaultValue={service?.deliverable_en ?? ''} required />
          )}
        </Field>
      </div>

      <div className="grid">
        <Field label={t('priceMin')} hint={t('priceHint')}>
          {({ id }) => (
            <Input
              id={id}
              name="priceMin"
              type="number"
              min={0}
              ltr
              defaultValue={service?.price_band_min_minor != null ? service.price_band_min_minor / 100 : ''}
            />
          )}
        </Field>
        <Field label={t('priceMax')}>
          {({ id }) => (
            <Input
              id={id}
              name="priceMax"
              type="number"
              min={0}
              ltr
              defaultValue={service?.price_band_max_minor != null ? service.price_band_max_minor / 100 : ''}
            />
          )}
        </Field>
        <Field label={t('currency')}>
          {({ id }) => <Input id={id} name="currency" ltr defaultValue={service?.currency ?? 'SAR'} />}
        </Field>
        <Field label={t('position')}>
          {({ id }) => (
            <Input id={id} name="position" type="number" ltr defaultValue={service?.position ?? 0} />
          )}
        </Field>
      </div>

      <div className="stack stack-3">
        <span className="t-fine text-muted">{t('status')}</span>
        <Seg label={t('status')}>
          <SegOption name="status" value="draft" defaultChecked={(service?.status ?? 'draft') === 'draft'}>
            {t('draft')}
          </SegOption>
          <SegOption name="status" value="published" defaultChecked={service?.status === 'published'}>
            {t('published')}
          </SegOption>
          <SegOption name="status" value="archived" defaultChecked={service?.status === 'archived'}>
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
          {pending ? t('saving') : service ? t('save') : t('create')}
        </Button>
      </div>
    </form>
  );
}
