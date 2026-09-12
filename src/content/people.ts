import type { Localized, MaybePlaceholder } from './types';

/**
 * Instructors.
 *
 * Open decision 5 — names, roles and photographs for the 4–10 people — is not
 * answered. Named practitioners are the entire credibility argument, which is
 * exactly why nothing here is invented: a fabricated engineer on a page whose
 * whole claim is "taught by practitioners" would be the one lie the brand
 * cannot afford. These are empty slots that say they are empty, and no
 * photography exists either (handoff: *Assets*).
 *
 * Shape mirrors `public.profiles`.
 */
export type Person = MaybePlaceholder<{
  id: string;
  handle?: string;
  displayName: string;
  headline: Localized;
  avatarUrl?: string;
}>;

const PENDING_TEAM = 'open decision 5 — the team';

function pendingPerson(id: string): Person {
  return {
    id,
    displayName: '—',
    headline: {
      ar: 'اسم المهندس ودوره قيد التحديد',
      en: 'Engineer name and role pending',
    },
    placeholder: true,
    blockedBy: PENDING_TEAM,
  };
}

export const people: Person[] = [
  pendingPerson('instructor-1'),
  pendingPerson('instructor-2'),
  pendingPerson('instructor-3'),
];

export function getPerson(id: string) {
  return people.find((person) => person.id === id);
}

/**
 * The people a public page may show: the ones with real names.
 *
 * Public surfaces read this, not `people`. An empty team section is better
 * than three striped rectangles and a row of "pending" chips — the gap belongs
 * in the admin area, in front of whoever can fill it, not on the front page in
 * front of a visitor.
 */
export const namedPeople = people.filter((person) => !person.placeholder);
