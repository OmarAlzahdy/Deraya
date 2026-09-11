import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Latin digits in both locales — see format.ts for why.
    formats: {
      number: {
        default: { numberingSystem: 'latn' },
        currency: { style: 'currency', currency: 'SAR', numberingSystem: 'latn' },
      },
    },
  };
});
