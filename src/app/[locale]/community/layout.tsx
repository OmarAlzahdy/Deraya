/**
 * Threads change as people post, and the ask form depends on the session, so
 * the community renders per request rather than from a build-time snapshot.
 */
export const dynamic = 'force-dynamic';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
