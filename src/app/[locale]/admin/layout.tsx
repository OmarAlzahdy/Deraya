/**
 * Everything under /admin depends on who is asking, so nothing here may be
 * prerendered: a statically captured redirect would be served to an
 * administrator, and a statically captured page would be served to everyone
 * else. The guard runs per page and every action re-checks the role.
 */
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
