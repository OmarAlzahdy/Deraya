'use client';

import { Link, usePathname } from '@/i18n/navigation';

/** Side navigation for the admin area, with the current section marked. */
export function AdminNav({
  labels,
}: {
  labels: { overview: string; courses: string; services: string };
}) {
  const pathname = usePathname();

  const items = [
    { href: '/admin', label: labels.overview, exact: true },
    { href: '/admin/tracks', label: labels.courses, exact: false },
    { href: '/admin/services', label: labels.services, exact: false },
  ] as const;

  return (
    <nav className="admin-side" aria-label={labels.overview}>
      {items.map((item) => {
        const current = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="admin-side-link"
            aria-current={current ? 'page' : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
