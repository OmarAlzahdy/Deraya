import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';

/**
 * Where the email confirmation and password-recovery links land. Exchanges the
 * one-time code for a session, then sends the member on to wherever they were
 * going. Lives outside the [locale] segment — it is a machine endpoint, not a
 * page — so the proxy's matcher skips it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const locale = searchParams.get('locale') ?? routing.defaultLocale;

  // Only ever redirect within this origin: an open redirect here would hand a
  // freshly minted session to whatever host the query string named.
  const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : `/${locale}`;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/${locale}/sign-in?error=link`);
}
