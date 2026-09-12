# دراية · Deraya

An AI school and an engineering practice, in one place — from zero to
production, in Arabic and English.

**What is built:** a working platform. Accounts (sign-up, sign-in, sessions,
profiles), a community layer with threaded questions and an engineer badge that
cannot be faked, an admin area where courses and services are created, edited
and published, and the public pages that read them — Home, Track detail,
Services — in Arabic and English.

**What it runs on:** Postgres via Supabase, with row-level security on every
table and three database triggers covering the things RLS cannot police. The
schema, its policies and its triggers are tested; the whole platform is
verified end to end through a browser (`test/local-stack`).

**What is still open:** a Supabase project to point it at, and the content the
brief never decided — the launch track list, prices and the team. Content gaps
render as visible markers naming the decision that fills them, rather than
invented specifics. See [Open decisions](#open-decisions).

## Stack

The repository was empty at handoff, so the framework was chosen here: **Next.js
(App Router) + TypeScript**, with **next-intl** for the i18n layer, **Supabase**
for the backend and **Phosphor** for icons. Styling is plain CSS custom
properties and the design system's own component classes — no utility
framework, because the handoff's design system already ships a class layer to
map onto rather than reinvent.

```bash
npm install
cp .env.example .env.local   # fill in from your Supabase project
npm run dev                  # http://localhost:3000 → /ar or /en
npm run check                # typecheck + lint + the RTL guard
npm run build
```

Without `.env.local` the site still runs: the marketing pages fall back to
placeholder content. Accounts, community and admin need the database.

Connecting a project:

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push          # applies supabase/migrations/
```

Then make yourself the first administrator — nobody can self-promote, so this
one is SQL, once, from the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where handle = 'your-handle';
```

## Where things are

| Path | What it is |
| --- | --- |
| `src/styles/tokens.css` | The Signal palette, type scale, spacing, radii, elevation. The source of truth — never hard-code a value this file carries |
| `src/styles/tokens.status.css` | Error and warning colors. Success has no hue by design — see open decision 2 |
| `src/styles/rtl.css` | Mirroring, direction islands, bilingual kickers, language runs |
| `src/styles/components.css` | The Nocturne class layer, re-tinted to Signal and rewritten in logical properties |
| `src/components/ui/` | The component layer over those classes |
| `src/i18n/` | Locale routing, request config, number and date formatting |
| `src/proxy.ts` | Locale negotiation and Supabase session refresh, in that order |
| `src/lib/auth.ts` | Who is asking: `getProfile`, `requireProfile`, `requireAdmin` |
| `src/lib/supabase/` | Typed client for browser and server, session refresh, introspected database types |
| `src/lib/data/` | Queries behind the pages, with a pre-provisioning fallback |
| `supabase/` | Schema, RLS policies, triggers, and the tests that exercise them |
| `test/local-stack/` | Running and verifying the platform without Docker |
| `messages/{ar,en}.json` | Copy. Approved brand copy is used verbatim |

## Screens

| Route | Screen |
| --- | --- |
| `/ar`, `/en` | 01 Home |
| `/[locale]/tracks/[slug]` | 02 Track detail |
| `/[locale]/services` | 03 Services and code review |
| `/[locale]/community` | 06 Community — threads, tags, engineer badge |
| `/[locale]/community/[id]` | A thread: answers, accepting one, mixed direction |
| `/[locale]/admin` | Courses and services: create, edit, publish, delete |
| `/[locale]/account` | The member's own profile |
| `/[locale]/sign-in`, `/sign-up` | Accounts |
| `/[locale]/system` | The foundations reference — not one of the eight screens |

Screens 04 (assessment), 05 (public profile), 07 (dashboard) and 08 (review
thread) are not built. The schema carries all four, and screen 08's hardest
part already exists as `src/components/ReviewExcerpt.tsx`.

## Access model

Three layers, and each one assumes the others may fail:

1. **The route** checks the role. A member who is not an admin gets a 404 on
   `/admin`, not a "forbidden" — the routes do not advertise themselves.
2. **Every server action** re-checks the role before it writes.
3. **Row-level security** would refuse the write regardless. It is on for every
   table and denies by default, with read policies written for the logged-out
   case first, because the public pages and community threads work without a
   session.

Two things RLS alone could not police, now enforced by triggers:

- A member could set their own `role` to `admin`, since the self-update policy
  covers every column on their row. Role changes now require an admin.
- A client could post `authored_as: 'engineer'` and claim the badge the whole
  community layer rests on. It is stamped from the author's real role at write
  time and frozen, so a later promotion does not rewrite history.

## Layout and density

Two decisions carry most of the look:

**A centred frame, asymmetric inside it.** The brief asks for flush-to-the-
leading-edge composition with whitespace trailing. Taken literally — a fixed
column pinned to the window edge — that leaves a void at 1600px and reads as a
broken page. What it describes is an editorial grid: twelve columns, content in
the leading seven or eight, and the trailing four carrying an aside. So the
track page's price and length sit in a sticky rail beside the outline, the
community's tag filter sits beside the thread list, and the home page's proof
artifact sits beside the claim it backs. The whitespace is structural rather
than left over.

**Density is a property of the surface.** The 0.70× scale the brief specifies
is right for surfaces people work in — tables, the admin editors — and wrong
for surfaces people read, where it reads as cramped rather than dense. Reading
pages use the `--flow-*` steps and `--section-gap`; working surfaces keep
`--space-*`. Both are in `tokens.css`.

## The RTL contract

This is the constraint the handoff calls the biggest, so it is enforced rather
than documented:

- Direction is set once, on `<html>`, from the locale. There is no mirrored
  stylesheet.
- All layout CSS uses logical properties. `npm run check:rtl` fails the build on
  a physical `left`/`right` property; a line that genuinely needs one carries an
  `rtl-ok:` comment saying why.
- Directional icons opt into mirroring (`<Icon directional>` / `.mirror-rtl`).
  Arrows, chevrons and progress mirror; clocks, checks and magnifiers do not.
- These never mirror and stay LTR inside an RTL page: numbers, code blocks,
  repo paths, diffs, terminal output, file trees, URLs. Use `<Ltr>`, `<Num>`
  and `<CodeBlock>` — they set direction *and* isolate the run so it cannot
  reorder the Arabic text around it.
- A run of one language inside the other (the wordmark دراية on an English
  page) uses `<LangRun lang="…">`, which switches the face and isolates it.
- Latin kickers are uppercase with tracking; Arabic kickers use size and color
  instead. `<Kicker>` handles the switch — Arabic is never uppercased,
  letter-spaced or condensed.
- Arabic line-height is 1.5 minimum, set in the token layer, not per component.
- The language switch is a persistent header control and a real link, so it
  works without JavaScript. The choice persists in the `NEXT_LOCALE` cookie for
  a year and beats `Accept-Language` on later visits.

## Verified

- `/` negotiates to `/ar` or `/en`; both locales always carry a URL prefix, so
  neither language is the "real" site with the other bolted on.
- `<html dir>` is `rtl` for Arabic and `ltr` for English; the page is flush to
  the leading edge in both (measured: 120px of whitespace on the trailing side).
- Arabic sets in IBM Plex Sans Arabic at 1.85 line-height; English in Inter at
  1.65. Kickers: uppercase + 0.16em tracking in English, neither in Arabic.
- Code blocks compute to `direction: ltr` inside the Arabic page.
- No horizontal overflow at 390px in either language.
- Fonts are downloaded at build time and served from this origin (self-hosted),
  not from the Google CDN.
- In the review excerpt, the diff is an LTR island while the engineer's comment
  inside it follows the page: Arabic comment, English code, one block.
- 24 end-to-end checks pass through a browser against real Postgres and real
  PostgREST: sign-in, admin gating, creating a course and publishing it,
  editing a week, the course reaching both public pages, asking a question in
  Arabic with code that stays LTR, the engineer badge's integrity rules, and a
  signed-out visitor's view. `test/local-stack/e2e.mjs`.
- The schema applies to Postgres 16 and its policies were exercised — anonymous
  visitors see published tracks and public profiles but no submissions and no
  unshared results; a member sees their own work and not another's; an assigned
  reviewer sees the submission; sharing a result is what makes it public; and an
  insert on behalf of another member is refused. `supabase/tests/rls.sql`.

## Assumptions made, worth a look

1. **Framework and default locale.** Next.js App Router; `ar` is the fallback
   when locale negotiation is inconclusive, given the Gulf audience. Both
   languages are prefixed, so neither is privileged in URLs.
2. **Latin digits in both languages** (`1234`, not `١٢٣٤`). The register is
   technical and the surrounding material is code, prices and week counts. One
   constant in `src/i18n/format.ts` changes it.
3. **Gregorian calendar in both languages**, for the same reason.
4. **Status colors are a proposal**, isolated in one file — see open decision 2.
5. **The wordmark is a placeholder lockup** — دراية in IBM Plex Sans Arabic 500
   beside *Deraya* in Inter 500. No mark exists; one needs commissioning.
6. **No photography exists.** Every image slot renders a striped placeholder
   that says so in the interface rather than shipping a stock image.

## Open decisions

| # | Decision | State |
| --- | --- | --- |
| 1 | Palette | **Re-opened and re-resolved — Paper.** Deep teal `#006453` on warm white `#faf8f5`. Five directions were generated in OKLCH and compared as the same slice of the real interface; Paper was chosen. The study is at `docs/palette-study.md` |
| 2 | Status colors | **Resolved.** Only failure states get a hue — danger `#a8321f`, warning `#8a5a09`, both retuned for the light ground. Success is an accent check mark and a word, because a green close enough to read as success is close enough to read as a second accent. `src/styles/tokens.status.css` |
| 3 | Track list | **Open.** Which three launch, how long, what each ends with. Track pages render the structure with subjects marked pending |
| 4 | Prices | **Open.** Track price, review price, consulting day rate. Price slots are built and visibly empty — a wrong number on a buyer's page is a commercial claim |
| 5 | Team | **Open.** Names, roles and photographs for 4–10 people. Nothing is invented here on purpose: a fabricated engineer on a page whose claim is "taught by practitioners" is the one lie the brand cannot afford |
| 6 | Screen wireframes | **Resolved by proposal.** 01–03 are built as layout proposals to review running rather than as wireframes. 04–08 are not started |
| 7 | Backend | **Resolved — Supabase.** Schema, RLS, triggers and client are in the repository and tested end to end. **No project is provisioned**: the organisation is at the free tier's two-project cap, so `deraya` could not be created. Freeing a slot is the last step before this runs live |

### What it takes to go further

- **Provision Supabase.** The organisation currently holds four projects and
  the free tier allows two per member, so creating `deraya` is refused. Delete,
  pause or upgrade one, then `supabase link` and `supabase db push`.
- **Screens 04, 05, 07 and 08** (assessment, public profile, dashboard, review
  thread) are not built. The schema carries all four.
- **Booking and enrollment flows** do not exist. Their CTAs are visible and
  marked pending rather than linking somewhere that cannot honour them.
