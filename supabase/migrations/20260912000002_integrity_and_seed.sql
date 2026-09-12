-- ════════════════════════════════════════════════════════════════════════════
-- Integrity triggers, admin grants, and the seed content.
--
-- Three things the first migration left open, each of which RLS alone cannot
-- close. RLS decides which ROWS you may touch; it does not stop you writing a
-- value you should not be able to choose. All three below are about values.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Role escalation ─────────────────────────────────────────────────────
-- `profiles_update_self` lets a member update their own row, and `role` is a
-- column on that row — so without this, any member could make themselves an
-- admin and gain write access to every track and service. Role changes are an
-- admin action; everything else on the profile stays self-service.
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- `auth.uid() is null` is the server-side case: the service key, the SQL
  -- editor, a migration. RLS has already refused anonymous writes to this
  -- table (the update policy needs `id = auth.uid()`), so reaching here with
  -- no uid means the caller is administering the database, not a visitor.
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'insufficient_privilege: role is set by an administrator'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ── 2. The engineer badge ──────────────────────────────────────────────────
-- `answers.authored_as` drives the "answered by an engineer" badge, which is a
-- claim about who is speaking — the community layer's whole value. A client
-- must not be able to choose it, so it is stamped from the author's actual
-- role at write time, and frozen afterwards: an answer written as a member
-- stays that way even if the author is promoted later.
create or replace function public.stamp_authored_as()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select role into new.authored_as from public.profiles where id = new.author_id;
  return new;
end;
$$;

create trigger answers_stamp_authored_as
  before insert on public.answers
  for each row execute function public.stamp_authored_as();

create or replace function public.freeze_authored_as()
returns trigger
language plpgsql
as $$
begin
  new.authored_as = old.authored_as;
  return new;
end;
$$;

create trigger answers_freeze_authored_as
  before update on public.answers
  for each row execute function public.freeze_authored_as();

-- ── 3. The answered-by-an-engineer flag on a question ──────────────────────
-- Derived, never client-set: it is true when at least one answer on the thread
-- was written by staff. Maintained on insert and on delete so the list view
-- can filter without joining every answer.
create or replace function public.refresh_question_engineer_flag()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.question_id, old.question_id);
begin
  update public.questions q
     set answered_by_engineer = exists (
           select 1 from public.answers a
           where a.question_id = target
             and a.authored_as in ('engineer', 'instructor', 'admin')
         )
   where q.id = target;
  return coalesce(new, old);
end;
$$;

create trigger answers_refresh_engineer_flag
  after insert or delete on public.answers
  for each row execute function public.refresh_question_engineer_flag();

-- ── Admin writes ───────────────────────────────────────────────────────────
-- The policies already restrict these to admins; the grants let the request
-- reach them at all. Without delete, an admin could create a track but never
-- remove one.
grant insert, update, delete on
  public.tracks, public.track_weeks, public.track_instructors,
  public.services, public.tags
  to authenticated;
grant delete on public.answers, public.questions to authenticated;

-- Authors delete their own; admins delete anything.
create policy answers_delete on public.answers
  for delete using (author_id = auth.uid() or public.is_admin());
create policy questions_delete on public.questions
  for delete using (author_id = auth.uid() or public.is_admin());

-- ── Seed: the services from the brief ──────────────────────────────────────
-- Real content, published. Price bands are left null — open decision 4 — and
-- the interface says so rather than showing a number nobody approved.
insert into public.services
  (slug, title_ar, title_en, scope_ar, scope_en, deliverable_ar, deliverable_en,
   turnaround_days, status, position)
values
  ('ai-roadmap',
   'خارطة طريق للذكاء الاصطناعي', 'AI roadmap',
   'جلسة مع الفريق، ومراجعة لما هو قائم، وخطة مرتّبة بحسب الأثر والكلفة.',
   'A session with the team, a read of what exists, and a plan ordered by impact and cost.',
   'مستند خطة وقائمة أولويات قابلة للتنفيذ.',
   'A written plan and a prioritised list you can act on.',
   14, 'published', 1),
  ('code-review',
   'مراجعة الكود', 'Code review',
   'مهندس أول يقرأ المستودع ويكتب ملاحظات على مستوى السطر، لا ملخّصًا عامًّا.',
   'A senior engineer reads the repository and writes line-level comments, not a summary.',
   'ملاحظات على مستوى السطر في المستودع، وملخّص مكتوب لما يجب تغييره أولًا.',
   'Line-level comments on the repository, and a written summary of what to change first.',
   2, 'published', 2),
  ('github-building',
   'بناء المستودعات', 'GitHub building',
   'إعداد المستودع والتكامل المستمر والاختبارات، وبناء ما ينقص حتى يعمل المشروع.',
   'Repository setup, CI and tests, and building what is missing until the project runs.',
   'مستودع يعمل، بتكامل مستمر وقاعدة اختبارات.',
   'A working repository, with CI and a test base.',
   null, 'published', 3),
  ('sessions',
   'جلسات فردية', '1-on-1 sessions',
   'جلسة مباشرة مع مهندس يعمل في المجال، على كود حقيقي أو قرار معماري قائم.',
   'A live session with a working engineer, on real code or a live architectural decision.',
   'ملاحظات مكتوبة بعد الجلسة وخطوات تالية محدّدة.',
   'Written notes after the session and a specific next step.',
   null, 'published', 4)
on conflict (slug) do nothing;

-- Community tags. Track-specific tags are added by an admin with the track.
insert into public.tags (slug, label_ar, label_en) values
  ('retrieval', 'الاسترجاع', 'Retrieval'),
  ('evaluation', 'التقييم', 'Evaluation'),
  ('deployment', 'النشر', 'Deployment'),
  ('career', 'المسار المهني', 'Career'),
  ('code-review', 'مراجعة الكود', 'Code review')
on conflict (slug) do nothing;
