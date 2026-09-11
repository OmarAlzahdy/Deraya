'use client';

import { useId, useState, type ComponentProps, type ReactNode } from 'react';

/**
 * Text field with the system's inline validation: validate on blur, message
 * below the field, `aria-invalid` carrying the state to assistive tech.
 *
 * The error color is a proposal pending approval (open decision 2) — it lives
 * in one place, src/styles/tokens.status.proposal.css.
 */
export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  children: (props: { id: string; describedBy: string; invalid: boolean }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const messageId = `${id}-message`;
  const invalid = Boolean(error);

  return (
    <div className={['field', className].filter(Boolean).join(' ')}>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy: messageId, invalid })}
      {(error ?? hint) ? (
        <p
          id={messageId}
          className={['field-message', invalid ? 'field-message-error' : null]
            .filter(Boolean)
            .join(' ')}
        >
          {error ?? hint}
        </p>
      ) : null}
    </div>
  );
}

/** The text input itself. `ltr` pins a field whose content is never Arabic —
 *  an email address, a repo path, a URL — to an LTR run in both languages. */
export function Input({
  ltr = false,
  className,
  ...rest
}: { ltr?: boolean } & ComponentProps<'input'>) {
  return (
    <input
      className={['input', ltr ? 'ltr' : null, className].filter(Boolean).join(' ')}
      dir={ltr ? 'ltr' : undefined}
      {...rest}
    />
  );
}

export function Textarea({ className, ...rest }: ComponentProps<'textarea'>) {
  return <textarea className={['input', className].filter(Boolean).join(' ')} {...rest} />;
}

/** A field that validates on blur — the behavior the brief specifies. */
export function useBlurValidation(validate: (value: string) => string | undefined) {
  const [error, setError] = useState<string | undefined>();

  return {
    error,
    onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setError(validate(event.currentTarget.value));
    },
    onChange: () => {
      if (error) setError(undefined);
    },
  };
}
