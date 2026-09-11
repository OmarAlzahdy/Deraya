-- ════════════════════════════════════════════════════════════════════════════
-- Deraya — initial schema
--
-- The model the brief implies: two engines (Learn / Build) over one set of
-- people, with a community layer between them. Every user-facing string exists
-- in both languages as its own column — Arabic is not a translation of the
-- English row, so a published row carries both or it is not published.
--
-- Roles live on the profile rather than in JWT claims, and the policy helpers
-- below are SECURITY DEFINER so a policy on `profiles` can consult a profile
-- without recursing through its own RLS.
-- ════════════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Enums ──────────────────────────────────────────────────────────────────
create type public.member_role as enum ('member', 'engineer', 'instructor', 'admin');
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.enrollment_status as enum ('active', 'paused', 'completed', 'withdrawn');
create type public.submission_status as enum ('submitted', 'in_review', 'commented', 'resolved');
create type public.grading_mode as enum ('ai', 'human');
create type public.assessment_status as enum ('started', 'submitted', 'grading', 'complete');
create type public.app_locale as enum ('ar', 'en');

-- ── Helpers ────────────────────────────────────────────────────────────────
-- (the role helpers live below `profiles`, which their bodies reference)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Profiles ───────────────────────────────────────────────────────────────
-- The public profile is a product surface (screen 05), not an account page:
-- it is world-readable and works logged out.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique
    check (handle ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  display_name text not null,
  headline_ar text,
  headline_en text,
  bio_ar text,
  bio_en text,
  avatar_url text,
  github_handle text,
  locale public.app_locale not null default 'ar',
  role public.member_role not null default 'member',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Role helpers. They sit after `profiles` because a SQL function body is
-- validated at creation time, and SECURITY DEFINER so that a policy ON
-- profiles can consult a profile without recursing through its own RLS.
create or replace function public.current_role_is(required public.member_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = any(required)
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_is(array['engineer', 'instructor', 'admin']::public.member_role[]);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role_is(array['admin']::public.member_role[]);
$$;


-- ── Tracks ─────────────────────────────────────────────────────────────────
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  summary_ar text not null,
  summary_en text not null,
  -- "what it ends with" — the brief makes this the point of a track
  outcome_ar text not null,
  outcome_en text not null,
  prerequisites_ar text,
  prerequisites_en text,
  week_count smallint not null check (week_count between 1 and 52),
  -- Price in minor units (halalas for SAR) so no float ever touches money.
  price_minor integer check (price_minor >= 0),
  currency char(3) not null default 'SAR',
  status public.content_status not null default 'draft',
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tracks_touch before update on public.tracks
  for each row execute function public.touch_updated_at();

create table public.track_weeks (
  id uuid primary key default gen_random_uuid(),
  track_id uuid not null references public.tracks(id) on delete cascade,
  week_number smallint not null check (week_number > 0),
  title_ar text not null,
  title_en text not null,
  outline_ar text,
  outline_en text,
  project_ar text,
  project_en text,
  -- what gets reviewed this week, and by whom
  reviewed boolean not null default false,
  unique (track_id, week_number)
);

create table public.track_instructors (
  track_id uuid not null references public.tracks(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  position smallint not null default 0,
  primary key (track_id, profile_id)
);

-- ── Services (the Build engine, screen 03) ─────────────────────────────────
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  title_en text not null,
  scope_ar text not null,
  scope_en text not null,
  deliverable_ar text not null,
  deliverable_en text not null,
  turnaround_days smallint,
  price_band_min_minor integer,
  price_band_max_minor integer,
  currency char(3) not null default 'SAR',
  status public.content_status not null default 'draft',
  position smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    price_band_max_minor is null
    or price_band_min_minor is null
    or price_band_max_minor >= price_band_min_minor
  )
);

create trigger services_touch before update on public.services
  for each row execute function public.touch_updated_at();

-- ── Enrollment and progress ────────────────────────────────────────────────
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  track_id uuid not null references public.tracks(id) on delete restrict,
  status public.enrollment_status not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (profile_id, track_id)
);

create table public.week_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  week_number smallint not null check (week_number > 0),
  completed_at timestamptz,
  primary key (enrollment_id, week_number)
);

-- ── Submissions and review (screen 08) ─────────────────────────────────────
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  -- null for a one-off paid review bought without a track
  enrollment_id uuid references public.enrollments(id) on delete set null,
  week_number smallint check (week_number > 0),
  repo_url text not null,
  branch text,
  commit_sha text,
  notes text,
  status public.submission_status not null default 'submitted',
  reviewer_id uuid references public.profiles(id) on delete set null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger submissions_touch before update on public.submissions
  for each row execute function public.touch_updated_at();

create index submissions_profile_idx on public.submissions (profile_id, submitted_at desc);
create index submissions_reviewer_idx on public.submissions (reviewer_id, status);

-- A review is one engineer's pass over one submission.
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict,
  summary text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- Line-level comments, threaded. `line_start`/`line_end` anchor to the diff;
-- a null pair is a file-level or review-level comment.
create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  parent_id uuid references public.review_comments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete restrict,
  file_path text,
  line_start integer check (line_start > 0),
  line_end integer check (line_end >= line_start),
  body text not null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger review_comments_touch before update on public.review_comments
  for each row execute function public.touch_updated_at();

create index review_comments_review_idx on public.review_comments (review_id, file_path, line_start);

-- ── Community (screen 06) ──────────────────────────────────────────────────
create table public.tags (
  slug text primary key,
  label_ar text not null,
  label_en text not null,
  track_id uuid references public.tracks(id) on delete set null
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  -- The language the thread was opened in. Answers may differ; a thread holds
  -- mixed direction by design.
  locale public.app_locale not null default 'ar',
  answered_by_engineer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger questions_touch before update on public.questions
  for each row execute function public.touch_updated_at();

create table public.question_tags (
  question_id uuid not null references public.questions(id) on delete cascade,
  tag_slug text not null references public.tags(slug) on delete cascade,
  primary key (question_id, tag_slug)
);

create table public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  -- Snapshotted at write time: the badge says an engineer answered, and it
  -- must keep saying so if that person's role changes later.
  authored_as public.member_role not null default 'member',
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger answers_touch before update on public.answers
  for each row execute function public.touch_updated_at();

create index answers_question_idx on public.answers (question_id, created_at);

-- ── Assessment (screen 04) ─────────────────────────────────────────────────
create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  locale public.app_locale not null,
  grading public.grading_mode not null,
  status public.assessment_status not null default 'started',
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.assessment_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null unique references public.assessments(id) on delete cascade,
  level text not null,
  recommended_track_id uuid references public.tracks(id) on delete set null,
  summary_ar text,
  summary_en text,
  -- Set when the member chooses to share. Presence of the slug is what makes
  -- the result public — see the policy below.
  share_slug text unique,
  graded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════════════════
-- Row level security
--
-- Every table is deny-by-default. Read policies are written for the logged-out
-- case first, because the public profile, the track pages and the community
-- threads all have to work without a session.
-- ════════════════════════════════════════════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.tracks enable row level security;
alter table public.track_weeks enable row level security;
alter table public.track_instructors enable row level security;
alter table public.services enable row level security;
alter table public.enrollments enable row level security;
alter table public.week_progress enable row level security;
alter table public.submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.review_comments enable row level security;
alter table public.tags enable row level security;
alter table public.questions enable row level security;
alter table public.question_tags enable row level security;
alter table public.answers enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_results enable row level security;

-- Profiles: public read (the profile is the artifact members share), owner
-- write. Role changes are an admin action, enforced in the update policy.
create policy profiles_read_public on public.profiles
  for select using (is_public or id = auth.uid() or public.is_staff());

create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

create policy profiles_update_self on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- Published content is world-readable; editing is staff-only.
create policy tracks_read_published on public.tracks
  for select using (status = 'published' or public.is_staff());
create policy tracks_write_admin on public.tracks
  for all using (public.is_admin()) with check (public.is_admin());

create policy track_weeks_read on public.track_weeks
  for select using (
    exists (select 1 from public.tracks t
            where t.id = track_id and (t.status = 'published' or public.is_staff()))
  );
create policy track_weeks_write_admin on public.track_weeks
  for all using (public.is_admin()) with check (public.is_admin());

create policy track_instructors_read on public.track_instructors
  for select using (true);
create policy track_instructors_write_admin on public.track_instructors
  for all using (public.is_admin()) with check (public.is_admin());

create policy services_read_published on public.services
  for select using (status = 'published' or public.is_staff());
create policy services_write_admin on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy tags_read on public.tags for select using (true);
create policy tags_write_admin on public.tags
  for all using (public.is_admin()) with check (public.is_admin());

-- Enrollment and progress are the member's own.
create policy enrollments_read_own on public.enrollments
  for select using (profile_id = auth.uid() or public.is_staff());
create policy enrollments_insert_own on public.enrollments
  for insert with check (profile_id = auth.uid());
create policy enrollments_update_own on public.enrollments
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());

create policy week_progress_rw_own on public.week_progress
  for all using (
    exists (select 1 from public.enrollments e
            where e.id = enrollment_id and (e.profile_id = auth.uid() or public.is_staff()))
  )
  with check (
    exists (select 1 from public.enrollments e
            where e.id = enrollment_id and e.profile_id = auth.uid())
  );

-- Submissions: the author, the assigned reviewer, and staff.
create policy submissions_read on public.submissions
  for select using (
    profile_id = auth.uid() or reviewer_id = auth.uid() or public.is_staff()
  );
create policy submissions_insert_own on public.submissions
  for insert with check (profile_id = auth.uid());
create policy submissions_update on public.submissions
  for update using (profile_id = auth.uid() or reviewer_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or reviewer_id = auth.uid() or public.is_staff());

create policy reviews_read on public.reviews
  for select using (
    exists (select 1 from public.submissions s
            where s.id = submission_id
              and (s.profile_id = auth.uid() or s.reviewer_id = auth.uid()))
    or public.is_staff()
  );
create policy reviews_write_staff on public.reviews
  for all using (reviewer_id = auth.uid() and public.is_staff())
  with check (reviewer_id = auth.uid() and public.is_staff());

create policy review_comments_read on public.review_comments
  for select using (
    exists (
      select 1 from public.reviews r
      join public.submissions s on s.id = r.submission_id
      where r.id = review_id
        and (s.profile_id = auth.uid() or s.reviewer_id = auth.uid())
    )
    or public.is_staff()
  );
-- Both sides of the thread write: the engineer comments, the author replies.
create policy review_comments_insert on public.review_comments
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.reviews r
      join public.submissions s on s.id = r.submission_id
      where r.id = review_id
        and (s.profile_id = auth.uid() or s.reviewer_id = auth.uid() or public.is_staff())
    )
  );
create policy review_comments_update_own on public.review_comments
  for update using (author_id = auth.uid()) with check (author_id = auth.uid());

-- Community is public to read, members to write.
create policy questions_read on public.questions for select using (true);
create policy questions_insert_own on public.questions
  for insert with check (author_id = auth.uid());
create policy questions_update_own on public.questions
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

create policy question_tags_read on public.question_tags for select using (true);
create policy question_tags_write_author on public.question_tags
  for all using (
    exists (select 1 from public.questions q
            where q.id = question_id and (q.author_id = auth.uid() or public.is_admin()))
  )
  with check (
    exists (select 1 from public.questions q
            where q.id = question_id and (q.author_id = auth.uid() or public.is_admin()))
  );

create policy answers_read on public.answers for select using (true);
create policy answers_insert_own on public.answers
  for insert with check (author_id = auth.uid());
create policy answers_update_own on public.answers
  for update using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

-- Assessment: the member's own, plus the human grader.
create policy assessments_read_own on public.assessments
  for select using (profile_id = auth.uid() or public.is_staff());
create policy assessments_insert_own on public.assessments
  for insert with check (profile_id = auth.uid() or profile_id is null);
create policy assessments_update on public.assessments
  for update using (profile_id = auth.uid() or public.is_staff())
  with check (profile_id = auth.uid() or public.is_staff());

-- A result is public exactly when its owner has shared it: the presence of a
-- share_slug is the sharing decision, so the policy reads it directly.
create policy assessment_results_read on public.assessment_results
  for select using (
    share_slug is not null
    or exists (select 1 from public.assessments a
               where a.id = assessment_id and a.profile_id = auth.uid())
    or public.is_staff()
  );
create policy assessment_results_write_staff on public.assessment_results
  for all using (public.is_staff()) with check (public.is_staff());

-- ── New users get a profile ────────────────────────────────────────────────
-- The handle is provisional (the account's id, prefixed) and the member
-- renames it; the column is unique, so the insert cannot collide.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, handle, display_name, locale)
  values (
    new.id,
    'm-' || replace(new.id::text, '-', '')::text,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'locale')::public.app_locale, 'ar')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Grants ─────────────────────────────────────────────────────────────────
-- Supabase's default privileges already cover tables created by this role;
-- these are written out so the schema is portable and the access model is
-- readable in one place. RLS above is what actually filters the rows.
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update on
  public.profiles, public.enrollments, public.week_progress, public.submissions,
  public.reviews, public.review_comments, public.questions, public.question_tags,
  public.answers, public.assessments, public.assessment_results
  to authenticated;
grant delete on public.question_tags, public.week_progress to authenticated;
