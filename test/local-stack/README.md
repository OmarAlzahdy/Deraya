# Local stack

A way to run the whole platform — accounts, community, admin — against a real
Postgres and a real PostgREST, on a machine that cannot reach Docker Hub. It
exists because this project was built in an environment where container image
pulls are blocked, so `supabase start` is not available.

**What is real here:** the database, the schema in `supabase/migrations/`, every
row-level security policy, every trigger, and PostgREST — which is the same
component a Supabase project runs in front of its database. The queries the app
makes go through the real client library to the real API.

**What is a stand-in:** `gateway.mjs` serves a minimal GoTrue-compatible
`/auth/v1` (sign-up, password grant, refresh, user, logout) issuing real HS256
JWTs signed with the same secret PostgREST verifies. It is enough to exercise
the app's own auth paths end to end; it is **not** GoTrue, it is not a security
boundary, and it must never be deployed or pointed at anything but a throwaway
local database.

## Running it

```bash
# 1. A Postgres you can throw away
createdb deraya_live
psql -d deraya_live -f test/local-stack/supabase-compat.sql
psql -d deraya_live -f supabase/migrations/20260911000001_init.sql
psql -d deraya_live -f supabase/migrations/20260912000002_integrity_and_seed.sql

# 2. PostgREST on 54322 (see the conf block below), then the gateway on 54321
node test/local-stack/gateway.mjs

# 3. Point the app at it, with an anon JWT signed by the same secret
#    NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon JWT>
npm run build && npm start

# 4. Drive it
BASE_URL=http://localhost:3000 node test/local-stack/e2e.mjs ./shots
```

PostgREST config:

```
db-uri = "postgres://authenticator:authenticator@127.0.0.1:5432/deraya_live"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "super-secret-jwt-token-with-at-least-32-characters-long"
server-port = 54322
```

## What `e2e.mjs` covers

Sign-in and the signed-in header · admin closed to a member (404, not a
"forbidden") · editing your own profile · promotion in SQL opening the admin
area · creating a course and its weeks · editing a week · the published course
reaching the home page and the Arabic track page with its price · asking a
question in Arabic with a fenced code block that stays LTR · a member's answer
not earning the engineer badge · an engineer's answer earning it and flipping
the thread flag · the earlier answer keeping its stamp after promotion · an
engineer still not being an admin · a signed-out visitor reading a thread but
getting no answer form.

24 checks. Against a real Supabase project, the same file should pass unchanged
apart from the URL and key.
