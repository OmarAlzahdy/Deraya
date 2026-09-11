'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';
import { requireSupabaseEnv } from './env';

/** The browser client. One per tab; the SDK memoises the underlying connection. */
export function createClient() {
  const { url, key } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, key);
}
