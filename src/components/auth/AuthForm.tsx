'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Field';
import type { AuthState } from '@/app/[locale]/auth-actions';

type Action = (state: AuthState, formData: FormData) => Promise<AuthState>;

/**
 * Sign in and sign up are the same form with one extra field, so they are one
 * component. Errors come back from the server action as codes rather than
 * prose, and are translated here — an auth message is copy, not plumbing.
 */
export function AuthForm({
  mode,
  action,
  locale,
  next,
  origin,
}: {
  mode: 'signIn' | 'signUp';
  action: Action;
  locale: string;
  next?: string;
  origin: string;
}) {
  const t = useTranslations('auth');
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="stack stack-6" style={{ maxInlineSize: '380px' }}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="origin" value={origin} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === 'signUp' ? (
        <Field label={t('displayName')}>
          {({ id }) => <Input id={id} name="displayName" autoComplete="name" required />}
        </Field>
      ) : null}

      <Field label={t('email')}>
        {({ id }) => (
          <Input
            id={id}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            ltr
            required
          />
        )}
      </Field>

      <Field label={t('password')} hint={mode === 'signUp' ? t('passwordHint') : undefined}>
        {({ id }) => (
          <Input
            id={id}
            name="password"
            type="password"
            ltr
            autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
            required
          />
        )}
      </Field>

      {state.error ? (
        <p className="field-message field-message-error" role="alert">
          {t(`error.${state.error}` as 'error.credentials')}
        </p>
      ) : null}

      {state.notice ? (
        <p className="status status-success" role="status">
          {t(`notice.${state.notice}` as 'notice.confirm')}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={pending}>
        {pending ? t('working') : t(mode)}
      </Button>
    </form>
  );
}
