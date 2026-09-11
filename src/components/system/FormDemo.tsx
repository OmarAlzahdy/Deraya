'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Field, Input, Textarea, useBlurValidation } from '@/components/ui/Field';
import { Radio, Seg, SegOption } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

/**
 * The form controls in their real states, including validation on blur with
 * the message below the field — the behavior the handoff specifies.
 */
export function FormDemo() {
  const t = useTranslations();
  const [dialogOpen, setDialogOpen] = useState(false);

  const email = useBlurValidation((value) =>
    value.includes('@') ? undefined : t('form.emailError'),
  );

  return (
    <div className="stack stack-6">
      <div className="grid" style={{ alignItems: 'start' }}>
        <Field label={t('form.emailLabel')} error={email.error}>
          {({ id, describedBy, invalid }) => (
            <Input
              id={id}
              ltr
              type="email"
              inputMode="email"
              placeholder={t('form.emailPlaceholder')}
              aria-invalid={invalid}
              aria-describedby={invalid ? describedBy : undefined}
              onBlur={email.onBlur}
              onChange={email.onChange}
            />
          )}
        </Field>

        <Field label={t('form.repoLabel')}>
          {({ id }) => <Input id={id} ltr placeholder="omar/rag-service" />}
        </Field>
      </div>

      <Field label={t('form.notesLabel')}>
        {({ id }) => <Textarea id={id} rows={3} />}
      </Field>

      <div className="stack stack-3">
        <span className="t-fine text-muted">{t('form.gradingLabel')}</span>
        <Seg label={t('form.gradingLabel')}>
          <SegOption name="grading" value="ai" defaultChecked>
            {t('form.gradingAi')}
          </SegOption>
          <SegOption name="grading" value="human">
            {t('form.gradingHuman')}
          </SegOption>
        </Seg>
      </div>

      <fieldset className="stack stack-2" style={{ border: 0, margin: 0, padding: 0 }}>
        <legend className="t-fine text-muted" style={{ padding: 0 }}>
          {t('form.languageLabel')}
        </legend>
        <div className="row" style={{ gap: 'var(--space-6)' }}>
          <Radio name="answer-lang" value="ar" defaultChecked>
            <span lang="ar" dir="rtl" className="lang-run">
              العربية
            </span>
          </Radio>
          <Radio name="answer-lang" value="en">
            <span lang="en" dir="ltr" className="lang-run">
              English
            </span>
          </Radio>
        </div>
      </fieldset>

      <div className="row">
        <Button variant="primary" onClick={() => setDialogOpen(true)}>
          {t('cta.bookReview')}
        </Button>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t('cta.bookReview')}
        actions={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              {t('cta.cancel')}
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              {t('cta.startTrack')}
            </Button>
          </>
        }
      >
        {t('hero.supporting.two')}
      </Dialog>
    </div>
  );
}
