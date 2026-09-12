'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import { Seg, SegOption } from '@/components/ui/Choice';
import type { AccountState } from '@/app/[locale]/account/actions';
import type { Profile } from '@/lib/auth';

type Action = (state: AccountState, formData: FormData) => Promise<AccountState>;

/** The member's own profile. Role is not here — promotion is an admin action. */
export function AccountForm({ profile, action }: { profile: Profile; action: Action }) {
  const t = useTranslations('account');
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flow-6">
      <fieldset className="fieldset">
        <legend>{t('identity')}</legend>
      <Field label={t('displayName')}>
        {({ id }) => (
          <Input id={id} name="displayName" defaultValue={profile.display_name} required />
        )}
      </Field>

      <Field label={t('handle')} hint={t('handleHint')}>
        {({ id }) => <Input id={id} name="handle" defaultValue={profile.handle} ltr required />}
      </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend>{t('publicProfile')}</legend>
      <div className="grid-pair">
        <Field label={t('headlineAr')}>
          {({ id }) => (
            <Input id={id} name="headlineAr" defaultValue={profile.headline_ar ?? ''} lang="ar" />
          )}
        </Field>
        <Field label={t('headlineEn')}>
          {({ id }) => (
            <Input
              id={id}
              name="headlineEn"
              defaultValue={profile.headline_en ?? ''}
              lang="en"
              ltr
            />
          )}
        </Field>
      </div>

      <Field label={t('github')}>
        {({ id }) => (
          <Input
            id={id}
            name="github"
            defaultValue={profile.github_handle ?? ''}
            ltr
            placeholder="omar"
          />
        )}
      </Field>
      </fieldset>

      <fieldset className="fieldset">
        <legend>{t('preferences')}</legend>
        <div className="flow-3">
        <span className="field-label">{t('preferredLocale')}</span>
        <Seg label={t('preferredLocale')}>
          <SegOption name="preferredLocale" value="ar" defaultChecked={profile.locale === 'ar'}>
            <span lang="ar" dir="rtl" className="lang-run">
              العربية
            </span>
          </SegOption>
          <SegOption name="preferredLocale" value="en" defaultChecked={profile.locale === 'en'}>
            <span lang="en" dir="ltr" className="lang-run">
              English
            </span>
          </SegOption>
        </Seg>
        </div>
      </fieldset>

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

      <div className="row row-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
}
