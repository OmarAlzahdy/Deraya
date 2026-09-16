import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';

/**
 * `locale` is what the caller asked for; `requestLocale` is what the incoming
 * request implies. The explicit one wins, and the other must stay untouched
 * when it does: `requestLocale` is a getter that reaches for headers the
 * moment it is read, and the Open Graph image routes resolve their params at
 * build time, where there is no request to read. That is also why the params
 * object is not destructured — destructuring would read the getter.
 */
export default getRequestConfig(async (params) => {
  const requested = params.locale ?? (await params.requestLocale);
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
