# Palette: why Paper

The brief resolved the palette as **Signal** — teal on a deep petrol ground —
and the first build shipped it. It was re-opened after review, five full
directions were generated, and **Paper** was chosen.

## Method

Every option was generated in OKLCH on the one lightness scale the system has
always used, so step N of an accent matches step N of its neutrals in visual
weight. Each was then rendered as the *same* slice of the real product — header,
hero, track card, review diff, status row, band — because a palette is judged by
what it does to the interface, not by its swatches. Contrast was measured, not
estimated.

The five: **Signal** (teal on petrol, the incumbent), **Ember** (amber on
graphite), **Paper** (deep teal on warm white), **Meridian** (electric blue on
midnight), **Majlis** (deep green on sand).

## Paper

| Role | Value | Measured on the ground |
| --- | --- | --- |
| `--color-bg` | `#faf8f5` | warm white, never pure |
| `--color-surface` | `#ffffff` | |
| `--color-surface-sunken` | `#f2efe9` | |
| `--color-text` | `#16211f` | 15.58:1 |
| `--color-text-secondary` | `#3d4b48` | 8.62:1 |
| `--color-text-muted` | `#65736f` | 4.68:1 — the floor for body-size text |
| `--color-accent` | `#006453` | 6.72:1 on ground, 7.12:1 on surface |
| `--color-danger` | `#a8321f` | 6.31:1 |
| `--color-warning` | `#8a5a09` | 5.58:1 |

Accent ramp, hue 176, 100→900:
`#d3fff2` `#b3f5e3` `#8de3cd` `#66cab2` `#3eab93` `#118772` `#006453` `#004235` `#00221b`

Neutral ramp, hue 150 — a green bias, so the greys belong to the accent:
`#eef6f0` `#e0e8e1` `#cad2cc` `#b0b7b1` `#919892` `#707771` `#505751` `#333934` `#181d19`

## What the switch touched beyond the tokens

A light ground is not a hue swap. Four things in the system assumed a dark one:

- **Elevation.** It was a hairline edge plus ambient darkness. On a light ground
  darkness reads as dirt, so it became a hairline plus a soft shadow mixed from
  the *text* colour — a neutral-grey shadow on a warm ground looks like a smudge.
- **Imagery.** `.lighten` used `mix-blend-mode: lighten` so dark values fell away
  into a dark page. The class is now `.blend-photo` and uses `multiply`. **This
  reverses the brief's photography instruction**: it asked for subjects shot on
  dark or black backgrounds; Paper wants white or very light ones. Worth saying
  to whoever commissions the shoot.
- **The band.** `--color-section` is the one saturated field on the page, and on
  a light ground it is the one *dark* field — so it carries its own text colour,
  `--color-section-text`, rather than inheriting the page's ink.
- **Code.** Syntax colours were light-on-dark and inverted; diff line numbers
  moved off the rule colour, which vanishes on the sunken surface; and fenced
  code blocks gained a surface, because bare monospace on warm white reads as a
  typo rather than as code.

## If it needs to change again

The palette lives in `src/styles/tokens.css` and `src/styles/tokens.status.css`.
Swapping hues is those two files. Swapping *ground* — light to dark or back —
is those two plus the four items above.
