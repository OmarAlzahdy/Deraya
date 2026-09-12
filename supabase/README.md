# Database

The schema for the platform: tracks and weeks (Learn), services (Build),
enrollment and progress, submissions and line-level review, the community
threads, and the assessment with its shareable result.

Nothing is provisioned. `supabase/migrations/` is the whole of it, and no
Supabase project exists for Deraya yet — see the repository README.

## Shape

Every user-facing string is a pair of columns, `*_ar` and `*_en`. Arabic is not
a translation of the English row, so both are `not null` wherever the row is
publishable content.

Money is stored in minor units (halalas for SAR) as integers. No float touches
a price.

Row level security is on for every table and denies by default. Read policies
are written for the logged-out case first, because the public profile, the
track pages and the community threads all have to work without a session. Role
checks go through `public.is_staff()` / `public.is_admin()`, which are
`security definer` so a policy on `profiles` can consult a profile without
recursing through its own RLS.

## Applying it

```bash
npx supabase login
npx supabase link --project-ref <ref>
npx supabase db push
```

## Testing the policies

`tests/rls.sql` exercises the access model: what an anonymous visitor sees, what
a member sees of their own work, what a member does *not* see of someone
else's, what an assigned reviewer sees, and that sharing an assessment result is
what makes it public. It was run against Postgres 16 and passes.

Against a plain Postgres (no Supabase running), load the stub first:

```bash
psql "$DATABASE_URL" -f supabase/tests/auth_stub.sql
psql "$DATABASE_URL" -f supabase/migrations/20260911000001_init.sql
psql "$DATABASE_URL" -f supabase/tests/rls.sql
```

Against a local Supabase stack (`supabase start`), skip the stub — `auth.users`
and `auth.uid()` are already there.

## The first administrator

Nobody is an administrator by default, and nobody can promote themselves — a
trigger refuses any role change that does not come from an administrator or
from the database itself. So the first one is made in SQL, once, from the
Supabase SQL editor:

```sql
update public.profiles
   set role = 'admin'
 where handle = 'your-handle';   -- or: where id = '<auth user id>'
```

After that, `/[locale]/admin` opens for that account and everything else is
done in the interface. Engineers are promoted the same way, or by an admin
once a role editor exists.

## What the triggers guarantee

| Trigger | What it stops |
| --- | --- |
| `profiles_guard_role` | A member making themselves an admin by editing their own profile row |
| `answers_stamp_authored_as` | A client asking for the "answered by an engineer" badge |
| `answers_freeze_authored_as` | A promotion retroactively awarding that badge to old answers |
| `answers_refresh_engineer_flag` | The list view's badge drifting from the thread's answers |
| `on_auth_user_created` | A signed-up account with no profile row |

`tests/integrity.sql` exercises all of them, and `tests/rls.sql` covers the
row-level access model. Both pass against Postgres 16.
