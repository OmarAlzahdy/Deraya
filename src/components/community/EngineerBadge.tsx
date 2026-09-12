import { getTranslations } from 'next-intl/server';
import { SealCheck } from '@phosphor-icons/react/dist/ssr';

/**
 * "Answered by an engineer".
 *
 * The claim is only as good as what backs it: this reads `authored_as`, which
 * a database trigger stamps from the author's actual role at write time. A
 * client cannot ask for this badge, and promoting someone later does not
 * retroactively award it to their old answers.
 */
export async function EngineerBadge() {
  const t = await getTranslations('community');
  return (
    <span className="status status-success">
      <SealCheck size={15} weight="fill" aria-hidden />
      <span>{t('engineerAnswer')}</span>
    </span>
  );
}
