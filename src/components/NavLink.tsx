'use client';

import type { ComponentProps } from 'react';
import { Link, usePathname } from '@/i18n/navigation';

/**
 * A navigation link that knows whether it is the page you are on — `aria-current`
 * carries it to assistive technology and to the accent colour, from one source.
 * A section's child routes count as that section, so a thread still marks
 * Community.
 */
export function NavLink({
  href,
  children,
  ...rest
}: { href: ComponentProps<typeof Link>['href'] } & Omit<ComponentProps<typeof Link>, 'href'>) {
  const pathname = usePathname();
  const target = typeof href === 'string' ? href : '';
  const current = target !== '/' && pathname.startsWith(target);

  return (
    <Link
      href={href}
      className="nav-link"
      aria-current={current ? 'page' : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}
