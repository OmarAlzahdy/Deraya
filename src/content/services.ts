import type { Localized, MaybePlaceholder } from './types';

/**
 * Services — the Build engine, written for a buyer rather than a learner.
 *
 * Scope, turnaround and deliverable come from the brief. Price bands are open
 * decision 4 and are shown as a pending slot rather than a guess: pricing
 * changes this page's layout, and a wrong number here is a commercial claim.
 *
 * Shape mirrors `public.services`.
 */
export type Service = MaybePlaceholder<{
  slug: string;
  title: Localized;
  scope: Localized;
  deliverable: Localized;
  turnaroundDays?: number;
  turnaround: Localized;
  priceBand?: { minMinor: number; maxMinor: number; currency: string };
}>;

const PENDING_PRICE = 'open decision 4 — price bands';

export const services: Service[] = [
  {
    slug: 'ai-roadmap',
    title: { ar: 'خارطة طريق للذكاء الاصطناعي', en: 'AI roadmap' },
    scope: {
      ar: 'جلسة مع الفريق، ومراجعة لما هو قائم، وخطة مرتّبة بحسب الأثر والكلفة.',
      en: 'A session with the team, a read of what exists, and a plan ordered by impact and cost.',
    },
    deliverable: {
      ar: 'مستند خطة وقائمة أولويات قابلة للتنفيذ.',
      en: 'A written plan and a prioritised list you can act on.',
    },
    turnaround: { ar: 'أسبوعان', en: 'Two weeks' },
    turnaroundDays: 14,
    placeholder: true,
    blockedBy: PENDING_PRICE,
  },
  {
    slug: 'code-review',
    title: { ar: 'مراجعة الكود', en: 'Code review' },
    scope: {
      ar: 'مهندس أول يقرأ المستودع ويكتب ملاحظات على مستوى السطر، لا ملخّصًا عامًّا.',
      en: 'A senior engineer reads the repository and writes line-level comments, not a summary.',
    },
    deliverable: {
      ar: 'ملاحظات على مستوى السطر في المستودع، وملخّص مكتوب لما يجب تغييره أولًا.',
      en: 'Line-level comments on the repository, and a written summary of what to change first.',
    },
    turnaround: { ar: '48 ساعة', en: '48 hours' },
    turnaroundDays: 2,
    placeholder: true,
    blockedBy: PENDING_PRICE,
  },
  {
    slug: 'github-building',
    title: { ar: 'بناء المستودعات', en: 'GitHub building' },
    scope: {
      ar: 'إعداد المستودع والتكامل المستمر والاختبارات، وبناء ما ينقص حتى يعمل المشروع.',
      en: 'Repository setup, CI and tests, and building what is missing until the project runs.',
    },
    deliverable: {
      ar: 'مستودع يعمل، بتكامل مستمر وقاعدة اختبارات.',
      en: 'A working repository, with CI and a test base.',
    },
    turnaround: { ar: 'حسب النطاق', en: 'Scoped per engagement' },
    placeholder: true,
    blockedBy: PENDING_PRICE,
  },
  {
    slug: 'sessions',
    title: { ar: 'جلسات فردية', en: '1-on-1 sessions' },
    scope: {
      ar: 'جلسة مباشرة مع مهندس يعمل في المجال، على كود حقيقي أو قرار معماري قائم.',
      en: 'A live session with a working engineer, on real code or a live architectural decision.',
    },
    deliverable: {
      ar: 'ملاحظات مكتوبة بعد الجلسة وخطوات تالية محدّدة.',
      en: 'Written notes after the session and a specific next step.',
    },
    turnaround: { ar: 'خلال الأسبوع', en: 'Within the week' },
    placeholder: true,
    blockedBy: PENDING_PRICE,
  },
];
