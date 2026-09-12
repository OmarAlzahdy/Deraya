\set ON_ERROR_STOP on
-- Values RLS cannot police: who you are, and who is speaking.

insert into auth.users (id, email) values
  ('44444444-4444-4444-4444-444444444444', 'member@example.com'),
  ('55555555-5555-5555-5555-555555555555', 'eng@example.com');
update public.profiles set handle = 'member' where id = '44444444-4444-4444-4444-444444444444';
update public.profiles set handle = 'eng', role = 'engineer'
  where id = '55555555-5555-5555-5555-555555555555';

\echo '--- a member cannot promote themselves ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', false);
do $$
begin
  update public.profiles set role = 'admin' where id = auth.uid();
  raise exception 'FAIL: self-promotion to admin succeeded';
exception when insufficient_privilege then
  raise notice 'PASS: self-promotion to admin was blocked';
end $$;

\echo '--- but can still edit their own profile ---'
update public.profiles set display_name = 'Renamed' where id = auth.uid();
select 'own display_name updated (expect Renamed)' as check, display_name
  from public.profiles where id = '44444444-4444-4444-4444-444444444444';
reset role;

\echo '--- the engineer badge cannot be claimed by the client ---'
insert into public.questions (id, author_id, title, body, locale)
values ('cccccccc-0000-0000-0000-000000000001',
        '44444444-4444-4444-4444-444444444444', 'How do I evaluate retrieval?', 'body', 'en');

set role authenticated;
select set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', false);
-- The member asks for the engineer badge outright.
insert into public.answers (question_id, author_id, body, authored_as)
values ('cccccccc-0000-0000-0000-000000000001',
        '44444444-4444-4444-4444-444444444444', 'my answer', 'engineer');
reset role;

select 'member answer stamped as (expect member)' as check, authored_as
  from public.answers where author_id = '44444444-4444-4444-4444-444444444444';
select 'question flagged engineer-answered (expect f)' as check, answered_by_engineer
  from public.questions where id = 'cccccccc-0000-0000-0000-000000000001';

\echo '--- a real engineer answer flips the flag ---'
set role authenticated;
select set_config('request.jwt.claim.sub', '55555555-5555-5555-5555-555555555555', false);
insert into public.answers (question_id, author_id, body)
values ('cccccccc-0000-0000-0000-000000000001',
        '55555555-5555-5555-5555-555555555555', 'engineer answer');
reset role;

select 'engineer answer stamped as (expect engineer)' as check, authored_as
  from public.answers where author_id = '55555555-5555-5555-5555-555555555555';
select 'question flagged engineer-answered (expect t)' as check, answered_by_engineer
  from public.questions where id = 'cccccccc-0000-0000-0000-000000000001';

\echo '--- promotion does not rewrite history ---'
-- Clear the claim first: with one still set, the guard correctly refuses —
-- promotion is an admin action, and the last session here was an engineer.
select set_config('request.jwt.claim.sub', '', false);
update public.profiles set role = 'engineer' where id = '44444444-4444-4444-4444-444444444444';
select 'old answer still stamped (expect member)' as check, authored_as
  from public.answers where author_id = '44444444-4444-4444-4444-444444444444';

\echo '--- seeded services are public ---'
set role anon;
select 'published services visible to anon (expect 4)' as check, count(*) from public.services;
select 'tags visible to anon (expect 5)' as check, count(*) from public.tags;
reset role;
