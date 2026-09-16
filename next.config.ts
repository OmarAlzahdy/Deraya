import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,

  // Next writes AGENTS.md and CLAUDE.md into the repo root on every dev start.
  // This project keeps its written guidance in docs/ and the README.
  agentRules: false,

  /**
   * The share-card fonts are read from disk at request time, so nothing
   * imports them and the tracer has no reason to ship them. Named here, they
   * travel with the image routes; without this the cards render as empty
   * rectangles in production and nowhere else.
   */
  outputFileTracingIncludes: {
    '/[locale]/opengraph-image/[__metadata_id__]': ['./src/lib/og/fonts/**'],
    '/[locale]/tracks/[slug]/opengraph-image/[__metadata_id__]': ['./src/lib/og/fonts/**'],
    '/[locale]/community/[id]/opengraph-image/[__metadata_id__]': ['./src/lib/og/fonts/**'],
  },
};

export default withNextIntl(nextConfig);
