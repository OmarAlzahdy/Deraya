/**
 * The site's absolute origin.
 *
 * Open Graph is the reason this exists. A link pasted into WhatsApp is fetched
 * by a scraper that has no page context, so every URL it reads — `og:url`, the
 * image, the hreflang alternates — has to be absolute. Next only makes them
 * absolute if it knows the origin, and it cannot infer one.
 *
 * Preference order, most explicit first:
 *
 *  1. `NEXT_PUBLIC_SITE_URL` — set this once a real domain exists. It is the
 *     only one that survives a move off Vercel.
 *  2. `VERCEL_PROJECT_PRODUCTION_URL` — the project's stable production host,
 *     used only for production builds so previews do not claim to be the
 *     canonical site.
 *  3. `VERCEL_URL` — this particular deployment, which is what a preview
 *     should advertise: the image it names is the one it just built.
 *  4. localhost, for `next dev`.
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return new URL(/^https?:\/\//.test(explicit) ? explicit : `https://${explicit}`);
  }

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.VERCEL_ENV === 'production' && production) {
    return new URL(`https://${production}`);
  }

  const deployment = process.env.VERCEL_URL;
  if (deployment) return new URL(`https://${deployment}`);

  return new URL(`http://localhost:${process.env.PORT ?? 3000}`);
}

/** An absolute URL for a path on this site, for metadata that cannot be relative. */
export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl()).toString();
}
