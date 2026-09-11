# دراية · Deraya

An AI school and an engineering practice, in one place — from zero to
production, in Arabic and English.

**What is built:** the design token layer, the bilingual AR/EN routing and RTL
contract, the component layer, the database schema with its access model, and
screens 01–03 (Home, Track detail, Services).

**What those screens are:** layout proposals. No wireframe exists for any of
the eight surfaces, so these were built from the brief's required-elements
lists and are meant to be reviewed running, in both languages, and changed.

**What is deliberately missing:** every content specific the brief has not
decided. Track subjects, prices and the team render as visible markers naming
the decision that fills them — see [Open decisions](#open-decisions). Nothing
is invented to make a page look finished, and no engineer is named who does not
exist.

## Stack

The repository was empty at handoff, so the framework was chosen here: **Next.js
(App Router) + TypeScript**, with **next-intl** for the i18n layer, **Supabase**
for the backend and **Phosphor** for icons. Styling is plain CSS custom
properties and the design system's own component classes — no utility
framework, because the handoff's design system already ships a class layer to
map onto rather than reinvent.

```bash
npm install
npm run dev      # http://localhost:3000 → redirects to /ar or /en
npm run check    # typecheck + lint + the RTL guard
npm run build
```

## Where things are

| Path | What it is |
| --- | --- |
| `src/styles/tokens.css` | The Signal palette, type scale, spacing, radii, elevation. The source of truth — never hard-code a value this file carries |
| `src/styles/tokens.status.proposal.css` | Proposed error/warning/success colors, **pending approval** (open decision 2) |
| `src/styles/base.css` | Element defaults and the type scale as classes |
| `src/styles/rtl.css` | Mirroring, direction islands, bilingual kickers, language runs |
| `src/styles/layout.css` | Flush-to-the-leading-edge page shell, stacks, grids |
| `src/styles/components.css` | The Nocturne class layer, re-tinted to Signal and rewritten in logical properties |
| `src/components/ui/` | The React component layer over those classes |
| `src/i18n/` | Locale routing, request config, number and date formatting |
| `src/proxy.ts` | Locale negotiation: cookie → Accept-Language → default |
| `messages/{ar,en}.json` | Copy. Approved brand copy is used verbatim |
| `src/content/` | Content for the built screens, shaped like the database rows. Everything undecided is marked `placeholder` with the decision that fills it |
| `supabase/` | Schema, RLS policies and the test that exercises them — see `supabase/README.md` |
| `src/lib/supabase/` | Typed client for browser and server, session refresh, introspected database types |
| `/ar`, `/en` | Screen 01 — Home |
| `/ar/tracks/[slug]` | Screen 02 — Track detail |
| `/ar/services` | Screen 03 — Services and code review |
| `/ar/system`, `/en/system` | The foundations reference page — tokens, type, direction and components in both languages. Not one of the eight screens |

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
| 2 | Status colors | **Resolved.** Only failure states get a hue — danger `#ef8a7c`, warning `#e0a458`. Success is an accent check mark and a word, because a green close enough to read as success is close enough to read as a second accent. `src/styles/tokens.status.css` |
| 3 | Track list | **Open.** Which three launch, how long, what each ends with. Track pages render the structure with subjects marked pending |
| 4 | Prices | **Open.** Track price, review price, consulting day rate. Price slots are built and visibly empty — a wrong number on a buyer's page is a commercial claim |
| 5 | Team | **Open.** Names, roles and photographs for 4–10 people. Nothing is invented here on purpose: a fabricated engineer on a page whose claim is "taught by practitioners" is the one lie the brand cannot afford |
| 6 | Screen wireframes | **Resolved by proposal.** 01–03 are built as layout proposals to review running rather than as wireframes. 04–08 are not started |
| 7 | Backend | **Resolved — Supabase.** Schema, RLS and client are in the repository and tested. No project is provisioned and nothing has been applied to a remote database |

### What it takes to go further

- **Provision Supabase.** No Deraya project exists in the account. Once one is
  created, `supabase link` and `supabase db push` apply the migration, and
  `.env.example` names the two variables the app needs.
- **Screens 04–08** (assessment, public profile, community, dashboard, review
  thread) all need the backend live and a decision on auth. The review thread
  already has its component: `src/components/ReviewExcerpt.tsx` is the diff and
  the line-anchored comment, built to grow into screen 08.
- **Booking and enrollment flows** do not exist. Their CTAs are visible and
  marked pending rather than linking somewhere that cannot honour them.

