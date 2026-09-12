import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const SHOTS = process.argv[2];
const results = [];

function psql(query) {
  return execFileSync(
    'psql',
    ['-h', '127.0.0.1', '-p', '5433', '-U', 'postgres', '-d', 'deraya_live', '-tAX', '-c', query],
    { encoding: 'utf8' },
  ).trim();
}

function check(name, actual, expected) {
  const pass = String(actual) === String(expected);
  results.push({ name, pass, actual: String(actual).slice(0, 90) });
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${pass ? '' : `  (got: ${String(actual).slice(0, 90)})`}`);
}

async function signIn(page, email, password) {
  await page.goto(`${BASE}/en/sign-in`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('main button[type="submit"]');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch();

// ── 1. Sign in ──────────────────────────────────────────────────────────────
const omar = await browser.newContext();
const page = await omar.newPage();
await signIn(page, 'omar@deraya.test', 'deraya-test-1');
await page.goto(`${BASE}/en/account`, { waitUntil: 'networkidle' });
check('signed in, account page reachable', new URL(page.url()).pathname, '/en/account');
check(
  'header shows the member as signed in',
  await page.locator('nav a[href="/en/account"]').count(),
  1,
);

// ── 2. Admin is closed to a member ──────────────────────────────────────────
const adminAsMember = await page.goto(`${BASE}/en/admin`, { waitUntil: 'networkidle' });
check('member cannot reach admin', adminAsMember.status(), 404);

// ── 3. Editing my own profile works ─────────────────────────────────────────
await page.goto(`${BASE}/en/account`, { waitUntil: 'networkidle' });
await page.fill('input[name="handle"]', 'omar');
await page.click('main button[type="submit"]');
await page.waitForSelector('.status-success');
check('profile saved', psql("select handle from public.profiles where display_name = 'Omar'"), 'omar');

// ── 4. Promotion is an administrator's act, done in SQL ─────────────────────
psql("update public.profiles set role = 'admin' where handle = 'omar'");
await page.goto(`${BASE}/en/admin`, { waitUntil: 'networkidle' });
check('admin area opens for an admin', new URL(page.url()).pathname, '/en/admin');

// ── 5. Create a course ──────────────────────────────────────────────────────
await page.goto(`${BASE}/en/admin/tracks/new`, { waitUntil: 'networkidle' });
await page.fill('input[name="slug"]', 'applied-ai');
await page.fill('input[name="weekCount"]', '8');
await page.fill('input[name="titleAr"]', 'الذكاء الاصطناعي التطبيقي');
await page.fill('input[name="titleEn"]', 'Applied AI');
await page.fill('textarea[name="summaryAr"]', 'مسار عملي من الصفر إلى مشروع يعمل.');
await page.fill('textarea[name="summaryEn"]', 'A practical track from zero to a working project.');
await page.fill('textarea[name="outcomeAr"]', 'مستودع مُراجَع ومشروع يعمل.');
await page.fill('textarea[name="outcomeEn"]', 'A reviewed repository and a running project.');
await page.fill('input[name="price"]', '4500');
await page.click('label.seg-opt:has(input[value="published"])');
await page.click('main button[type="submit"]');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);
check('course created', psql("select slug from public.tracks where slug = 'applied-ai'"), 'applied-ai');
check('weeks laid out with it', psql("select count(*) from public.track_weeks tw join public.tracks t on t.id = tw.track_id where t.slug = 'applied-ai'"), '8');
await page.screenshot({ path: `${SHOTS}/e2e-admin-track.png`, fullPage: true });

// ── 6. Edit a week ──────────────────────────────────────────────────────────
await page.fill('form:has(input[name="weekId"]) input[name="titleEn"] >> nth=0', 'Retrieval basics');
await page.fill('form:has(input[name="weekId"]) input[name="titleAr"] >> nth=0', 'أساسيات الاسترجاع');
await page.click('main form:has(input[name="weekId"]) label.checkbox >> nth=0');
await page.click('main form:has(input[name="weekId"]) button[type="submit"] >> nth=0');
await page.waitForTimeout(1200);
check(
  'week edited',
  psql("select tw.title_en from public.track_weeks tw join public.tracks t on t.id = tw.track_id where t.slug = 'applied-ai' and tw.week_number = 1"),
  'Retrieval basics',
);

// ── 7. The published course reaches the public pages ────────────────────────
const anon = await browser.newContext();
const visitor = await anon.newPage();
await visitor.goto(`${BASE}/en`, { waitUntil: 'networkidle' });
check('published course on home', await visitor.locator('text=Applied AI').count() > 0, 'true');
await visitor.goto(`${BASE}/ar/tracks/applied-ai`, { waitUntil: 'networkidle' });
check('arabic track page renders the arabic title', await visitor.locator('h1').innerText(), 'الذكاء الاصطناعي التطبيقي');
check('price now shows', (await visitor.locator('main').innerText()).includes('4,500'), 'true');
await visitor.screenshot({ path: `${SHOTS}/e2e-track-ar.png`, fullPage: true });

// ── 8. Community: ask in Arabic with a code fence ────────────────────────────
await page.goto(`${BASE}/ar/community/ask`, { waitUntil: 'networkidle' });
await page.fill('input[name="title"]', 'كيف أقيس جودة الاسترجاع؟');
await page.fill(
  'textarea[name="body"]',
  'أحاول تقييم نتائج الاسترجاع في مشروعي وأحتاج مقياسًا عمليًا.\n\n```ts\nconst hits = await index.search(query, { k: topK });\n```\n\nما المقياس الذي تنصح به؟',
);
await page.click('label.checkbox:has(input[value="retrieval"])');
await page.click('main button[type="submit"]');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(1500);
const threadUrl = page.url();
check('question posted, landed on the thread', /\/ar\/community\/[0-9a-f-]{36}$/.test(threadUrl), 'true');

const codeDirection = await page.evaluate(() => {
  const block = document.querySelector('.code-block');
  return block ? getComputedStyle(block).direction : 'missing';
});
check('code block stays LTR inside the Arabic thread', codeDirection, 'ltr');
check('page itself is RTL', await page.evaluate(() => document.documentElement.dir), 'rtl');
await page.screenshot({ path: `${SHOTS}/e2e-thread-ar.png`, fullPage: true });

// ── 9. A member's answer does not get the engineer badge ────────────────────
const memberCtx = await browser.newContext();
const member = await memberCtx.newPage();
await member.goto(`${BASE}/en/sign-up`, { waitUntil: 'networkidle' });
await member.fill('input[name="displayName"]', 'Layla');
await member.fill('input[name="email"]', 'layla@deraya.test');
await member.fill('input[name="password"]', 'deraya-test-2');
await member.click('main button[type="submit"]');
await member.waitForLoadState('networkidle');
await member.waitForTimeout(1500);
check('second account created', psql("select display_name from public.profiles where display_name = 'Layla'"), 'Layla');

await member.goto(threadUrl.replace('/ar/', '/en/'), { waitUntil: 'networkidle' });
await member.fill('textarea[name="body"]', 'Try recall@k against a labelled set before anything fancier.');
await member.click('main form button[type="submit"] >> nth=-1');
await member.waitForLoadState('networkidle');
await member.waitForTimeout(1500);
await member.waitForTimeout(800);
check(
  'member answer stamped as member',
  psql("select authored_as from public.answers where body like 'Try recall%'"),
  'member',
);
check(
  'thread not flagged engineer-answered',
  psql("select answered_by_engineer from public.questions where title like 'كيف%'"),
  'f',
);

// ── 10. An engineer's answer does ───────────────────────────────────────────
psql("update public.profiles set role = 'engineer' where display_name = 'Layla'");
await member.goto(threadUrl.replace('/ar/', '/en/'), { waitUntil: 'networkidle' });
await member.fill('textarea[name="body"]', 'Start with recall@10 on a fixed eval set, then look at MRR.');
await member.click('main form button[type="submit"] >> nth=-1');
await member.waitForLoadState('networkidle');
await member.waitForTimeout(1500);
await member.waitForTimeout(800);
check(
  'engineer answer stamped as engineer',
  psql("select authored_as from public.answers where body like 'Start with recall%'"),
  'engineer',
);
check(
  'thread now flagged engineer-answered',
  psql("select answered_by_engineer from public.questions where title like 'كيف%'"),
  't',
);
await member.goto(threadUrl, { waitUntil: 'networkidle' });
check(
  'badge visible on the thread',
  (await member.locator('.status-success').allInnerTexts()).some((t) => t.includes('مهندس')),
  'true',
);
check(
  'earlier member answer still carries no badge',
  psql("select count(*) from public.answers where authored_as = 'member'"),
  '1',
);

// ── 11. A member still cannot write content ─────────────────────────────────
const memberAdmin = await member.goto(`${BASE}/en/admin/tracks/new`, { waitUntil: 'networkidle' });
check('engineer is not an admin', memberAdmin.status(), 404);

// ── 12. Signed-out visitor sees the thread but cannot answer ────────────────
await visitor.goto(threadUrl, { waitUntil: 'networkidle' });
check('thread is public', await visitor.locator('h1').count(), 1);
check('no answer form when signed out', await visitor.locator('textarea[name="body"]').count(), 0);

await browser.close();

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length === 0 ? 0 : 1);
