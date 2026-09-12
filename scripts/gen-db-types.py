import subprocess, collections

DB='deraya_v2'
def q(sql):
    out = subprocess.run(['psql','-h','127.0.0.1','-p','5433','-U','postgres','-d',DB,'-tAF','\x1f','-c',sql],
                         capture_output=True, text=True, check=True).stdout.strip()
    return [l.split('\x1f') for l in out.split('\n') if l]

TYPE_MAP = {'text':'string','uuid':'string','timestamptz':'string','date':'string','bpchar':'string',
 'jsonb':'Json','json':'Json','int2':'number','int4':'number','int8':'number','numeric':'number',
 'float4':'number','float8':'number','bool':'boolean'}

enums = collections.OrderedDict()
for name, label in q("""select t.typname, e.enumlabel from pg_type t
  join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace
  where n.nspname='public' order by t.typname, e.enumsortorder;"""):
    enums.setdefault(name, []).append(label)

cols = collections.OrderedDict()
for table, col, udt, nullable, has_default in q("""
  select c.table_name, c.column_name, c.udt_name, c.is_nullable,
         case when c.column_default is null then 'f' else 't' end
  from information_schema.columns c
  join information_schema.tables t on t.table_name=c.table_name and t.table_schema=c.table_schema
  where c.table_schema='public' and t.table_type='BASE TABLE'
  order by c.table_name, c.ordinal_position;"""):
    cols.setdefault(table, []).append((col, udt, nullable=='YES', has_default=='t'))

# Foreign keys, with uniqueness so one-to-one is accurate.
fks = collections.OrderedDict()
for table, conname, columns, ftable, fcolumns, is_unique in q("""
  select c.conrelid::regclass::text, c.conname,
         (select string_agg(a.attname, ',' order by k.ord)
            from unnest(c.conkey) with ordinality k(attnum, ord)
            join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.attnum),
         c.confrelid::regclass::text,
         (select string_agg(a.attname, ',' order by k.ord)
            from unnest(c.confkey) with ordinality k(attnum, ord)
            join pg_attribute a on a.attrelid=c.confrelid and a.attnum=k.attnum),
         case when exists (
           select 1 from pg_constraint u
           where u.conrelid=c.conrelid and u.contype in ('u','p') and u.conkey = c.conkey
         ) then 't' else 'f' end
  from pg_constraint c
  join pg_namespace n on n.oid=c.connamespace
  where c.contype='f' and n.nspname='public'
  order by 1, 2;"""):
    fks.setdefault(table.replace('public.',''), []).append(
        (conname, columns.split(','), ftable.replace('public.',''), fcolumns.split(','), is_unique=='t'))

def ts(udt):
    if udt in enums: return f'Database["public"]["Enums"]["{udt}"]'
    return TYPE_MAP.get(udt, 'string')

L = ['''/**
 * Database types — introspected from the migrations in supabase/migrations/
 * after applying them to Postgres 17 and exercising the policies.
 *
 * Regenerate rather than edit. With a project linked:
 *
 *     npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
 *
 * Without one (what produced this file), apply the migrations to any Postgres
 * and introspect it — the shape is the same.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {''']

for table, columns in cols.items():
    L.append(f'      {table}: {{')
    for kind in ('Row','Insert','Update'):
        L.append(f'        {kind}: {{')
        for col, udt, nullable, has_default in columns:
            t = ts(udt)
            if kind == 'Row':
                opt = ''
            elif kind == 'Insert':
                opt = '?' if (nullable or has_default) else ''
            else:
                opt = '?'
            L.append(f'          {col}{opt}: {t}{" | null" if nullable else ""};')
        L.append('        };')
    rels = fks.get(table, [])
    if rels:
        L.append('        Relationships: [')
        for conname, columns_, ftable, fcolumns, uniq in rels:
            cols_ts = ', '.join(f'"{c}"' for c in columns_)
            fcols_ts = ', '.join(f'"{c}"' for c in fcolumns)
            L.append('          {')
            L.append(f'            foreignKeyName: "{conname}";')
            L.append(f'            columns: [{cols_ts}];')
            L.append(f'            isOneToOne: {"true" if uniq else "false"};')
            L.append(f'            referencedRelation: "{ftable}";')
            L.append(f'            referencedColumns: [{fcols_ts}];')
            L.append('          },')
        L.append('        ];')
    else:
        L.append('        Relationships: [];')
    L.append('      };')

L.append('    };')
L.append('    Views: { [key: string]: never };')
L.append('    Functions: {')
L.append('      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };')
L.append('      is_staff: { Args: Record<PropertyKey, never>; Returns: boolean };')
L.append('    };')
L.append('    Enums: {')
for name, labels in enums.items():
    L.append(f'      {name}: {" | ".join(chr(34)+l+chr(34) for l in labels)};')
L.append('    };')
L.append('    CompositeTypes: { [key: string]: never };')
L.append('  };')
L.append('};')
L.append('')
L.append('export type Tables<T extends keyof Database["public"]["Tables"]> =')
L.append('  Database["public"]["Tables"][T]["Row"];')
L.append('export type TablesInsert<T extends keyof Database["public"]["Tables"]> =')
L.append('  Database["public"]["Tables"][T]["Insert"];')
L.append('export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =')
L.append('  Database["public"]["Tables"][T]["Update"];')
L.append('export type Enums<T extends keyof Database["public"]["Enums"]> =')
L.append('  Database["public"]["Enums"][T];')
L.append('')

open('/home/user/Deraya/src/lib/supabase/database.types.ts','w').write('\n'.join(L))
print(f'{len(cols)} tables, {len(enums)} enums, {sum(len(v) for v in fks.values())} foreign keys')
