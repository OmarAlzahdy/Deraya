import type { ComponentProps, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

type CommonProps = {
  variant?: Variant;
  /** Square icon-only button. Pass an accessible label with it. */
  icon?: boolean;
  block?: boolean;
  className?: string;
  children?: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<'button'>, 'className' | 'children'> & { href?: never };

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, 'className' | 'children' | 'href'> & {
    href: ComponentProps<typeof Link>['href'];
  };

function classes({ variant = 'secondary', icon, block, className }: CommonProps) {
  return [
    'btn',
    variantClass[variant],
    icon ? 'btn-icon' : null,
    block ? 'btn-block' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * The system's action. The primary variant is a 1px accent outline on
 * transparent — never a fill. Hover, pressed, focus and disabled states are
 * carried by the class layer; do not restyle them at the call site.
 *
 * Renders a locale-aware link when `href` is given, a button otherwise.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant, icon, block, className, children, ...rest } = props;
  const cls = classes({ variant, icon, block, className });

  if ('href' in rest && rest.href !== undefined) {
    const { href, ...linkProps } = rest as ButtonAsLink;
    return (
      <Link href={href} className={cls} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = 'button', ...buttonProps } = rest as ButtonAsButton;
  return (
    <button type={type} className={cls} {...buttonProps}>
      {children}
    </button>
  );
}
