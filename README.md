# دراية · Deraya

An AI school and an engineering practice, in one place — from zero to
production, in Arabic and English.

This repository is at the **foundation stage**: the design token layer, the
bilingual AR/EN routing and the RTL contract are built and verified. None of
the eight product screens are built — they have no approved layouts yet, and
several of them are blocked on decisions listed under
[Open decisions](#open-decisions) below.

## Stack

The repository was empty at handoff, so the framework was chosen here: **Next.js
(App Router) + TypeScript**, with **next-intl** for the i18n layer and
**Phosphor** for icons. Styling is plain CSS custom properties and the design
system's own component classes — no utility framework, because the handoff's
design system already ships a class layer to map onto rather than reinvent.

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

Blocking, from the handoff. The first four block the launch screens:

| # | Decision | Blocks |
| --- | --- | --- |
| 2 | Status colors — error / warning / success, and whether success gets a hue at all given the teal accent | forms everywhere, assessment results, review states |
| 3 | Track list — which three launch, length, what each ends with | screens 01, 02 |
| 4 | Prices — track, review, consulting day rate, even as bands | screens 02, 03 |
| 5 | Team — names, roles, photos for 4–10 people | screens 01, 02 |
| 6 | Screen wireframes — none of the eight has an approved layout | all eight |
| 7 | Backend — no API, data model or auth decision exists | 04–08 |

