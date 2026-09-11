\set ON_ERROR_STOP on
-- Two members and one engineer.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'learner@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'other@example.com'),
  ('33333333-3333-3333-3333-333333333333', 'engineer@example.com');

update public.profiles set role = 'engineer', handle = 'engineer'
  where id = '33333333-3333-3333-3333-333333333333';
update public.profiles set handle = 'learner' where id = '11111111-1111-1111-1111-111111111111';
update public.profiles set handle = 'other' where id = '22222222-2222-2222-2222-222222222222';

insert into public.tracks (slug, title_ar, title_en, summary_ar, summary_en, outcome_ar, outcome_en, week_count, status)
values ('published-track', 'ا', 'A', 'ا', 'A', 'ا', 'A', 12, 'published'),
       ('draft-track', 'ب', 'B', 'ب', 'B', 'ب', 'B', 8, 'draft');

insert into public.submissions (id, profile_id, repo_url, reviewer_id)
values ('aaaaaaaa-0000-0000-0000-000000000001',
        '11111111-1111-1111-1111-111111111111',
        'https://github.com/learner/rag-service',
        '33333333-3333-3333-3333-333333333333');

insert into public.assessments (id, profile_id, locale, grading)
values ('bbbbbbbb-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'ar', 'ai');
insert into public.assessment_results (assessment_id, level, share_slug)
values ('bbbbbbbb-0000-0000-0000-000000000001', 'intermediate', null);

\echo '--- anon ---'
set role anon;
select 'tracks visible to anon (expect 1)' as check, count(*) from public.tracks;
select 'profiles visible to anon (expect 3)' as check, count(*) from public.profiles;
select 'submissions visible to anon (expect 0)' as check, count(*) from public.submissions;
select 'unshared result visible to anon (expect 0)' as check, count(*) from public.assessment_results;
reset role;

\echo '--- author ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select 'own submission (expect 1)' as check, count(*) from public.submissions;
select 'own result (expect 1)' as check, count(*) from public.assessment_results;
reset role;

\echo '--- unrelated member ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
select 'other member sees submission (expect 0)' as check, count(*) from public.submissions;
select 'other member sees draft track (expect 1 published only)' as check, count(*) from public.tracks;
reset role;

\echo '--- assigned reviewer (engineer) ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);
select 'reviewer sees submission (expect 1)' as check, count(*) from public.submissions;
select 'engineer sees draft track (expect 2)' as check, count(*) from public.tracks;
reset role;

\echo '--- sharing makes the result public ---'
update public.assessment_results set share_slug = 'level-intermediate-abc';
set role anon;
select 'shared result visible to anon (expect 1)' as check, count(*) from public.assessment_results;
reset role;

\echo '--- a member cannot write someone else''s submission ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$
begin
  insert into public.submissions (profile_id, repo_url)
  values ('11111111-1111-1111-1111-111111111111', 'https://github.com/x/y');
  raise exception 'FAIL: insert on behalf of another member succeeded';
exception when insufficient_privilege then
  raise notice 'PASS: insert on behalf of another member was blocked';
end $$;
reset role;
