import type { ComponentProps, ReactNode } from 'react';

/**
 * Direction islands.
 *
 * These never mirror and stay LTR inside an RTL page: numbers, code blocks,
 * repo paths, diffs, terminal output, file trees, URLs. Wrapping them keeps
 * them readable and stops them reordering the Arabic text around them.
 */

/** A bare LTR run inside a paragraph — a repo path, a URL, a technical term. */
export function Ltr({
  children,
  className,
  ...rest
}: { children: ReactNode } & ComponentProps<'span'>) {
  return (
    <span dir="ltr" className={['ltr', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}

/** A number. Latin digits, tabular figures, its own LTR run. */
export function Num({
  children,
  className,
  ...rest
}: { children: ReactNode } & ComponentProps<'span'>) {
  return (
    <span dir="ltr" className={['num', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}

/** Preformatted code. Always LTR, always left-aligned, scrolls rather than wraps. */
export function CodeBlock({
  children,
  className,
  ...rest
}: { children: ReactNode } & ComponentProps<'pre'>) {
  return (
    <pre dir="ltr" className={['code-block', className].filter(Boolean).join(' ')} {...rest}>
      <code>{children}</code>
    </pre>
  );
}

/**
 * A run of one language inside a page set in the other — the Arabic wordmark
 * on an English page, an English term in an Arabic sentence. Takes that
 * language's face and its own direction.
 */
export function LangRun({
  lang,
  children,
  className,
  ...rest
}: { lang: 'ar' | 'en'; children: ReactNode } & ComponentProps<'span'>) {
  return (
    <span
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={['lang-run', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </span>
  );
}
