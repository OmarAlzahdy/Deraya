import type { ReactNode } from 'react';

/** Radio on a native input — no script, no re-styled browser default. */
export function Radio({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="radio">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} />
      <span className="dot" />
      <span>{children}</span>
    </label>
  );
}

/** Checkbox on a native input, with a visible box — see .checkbox. */
export function Checkbox({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value?: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="checkbox">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} />
      <span className="box" />
      <span>{children}</span>
    </label>
  );
}

/**
 * Segmented control, also native radios. Used for choices that must be visible
 * rather than hidden behind a select — the assessment's AR/EN and
 * AI-graded/human-reviewed choices are the reason it exists.
 */
export function Seg({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function SegOption({
  name,
  value,
  defaultChecked,
  children,
}: {
  name: string;
  value: string;
  defaultChecked?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="seg-opt">
      <input type="radio" name={name} value={value} defaultChecked={defaultChecked} />
      <span>{children}</span>
    </label>
  );
}
