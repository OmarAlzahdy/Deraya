#!/usr/bin/env node
/**
 * RTL is a layout mode, not a stylesheet fork — which only holds if layout CSS
 * stays in logical properties. This check fails on a physical one.
 *
 * A line that genuinely needs a physical property — a code block that must stay
 * left-aligned in both directions, for instance — opts out explicitly by
 * carrying an `rtl-ok:` comment that says why.
 *
 * Run: npm run check:rtl
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = new URL('../src', import.meta.url).pathname;
const OPT_OUT = /rtl-ok:/;

/* Only the properties direction actually flips. Sizes (width/height) are not
   an RTL concern and are left alone. */
const CSS_RULES = [
  [
    /\b(?:margin|padding|border|inset|scroll-margin|scroll-padding)-(?:left|right)\b/,
    'physical side property (use -inline-start / -inline-end)',
  ],
  [/(?:^|[;{\s])(?:left|right)\s*:/, 'physical offset (use inset-inline-start / -end)'],
  [/\btext-align\s*:\s*(?:left|right)\b/, 'physical text-align (use start / end)'],
  [/\bfloat\s*:\s*(?:left|right)\b/, 'physical float (use inline-start / inline-end)'],
  [/\bborder-radius\s*:\s*[^;]*\b(?:top-left|top-right|bottom-left|bottom-right)\b/, 'physical corner'],
];

const JSX_RULES = [
  [
    /\b(?:marginLeft|marginRight|paddingLeft|paddingRight|borderLeft|borderRight|insetLeft|insetRight)\b/,
    'physical property in an inline style',
  ],
  [/textAlign:\s*['"](?:left|right)['"]/, 'physical text-align in an inline style'],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const failures = [];

for await (const file of walk(ROOT)) {
  const ext = extname(file);
  const rules = ext === '.css' ? CSS_RULES : ext === '.tsx' || ext === '.ts' ? JSX_RULES : null;
  if (!rules) continue;

  const lines = (await readFile(file, 'utf8')).split('\n');
  lines.forEach((line, index) => {
    if (OPT_OUT.test(line)) return;
    for (const [pattern, reason] of rules) {
      if (pattern.test(line)) {
        failures.push(`  ${file.replace(ROOT, 'src')}:${index + 1}  ${reason}\n      ${line.trim()}`);
        break;
      }
    }
  });
}

if (failures.length) {
  console.error(`Physical properties in layout code (${failures.length}):\n`);
  console.error(failures.join('\n'));
  console.error('\nUse logical properties, or mark the line with an rtl-ok comment saying why.');
  process.exit(1);
}

console.log('Logical properties: clean.');
