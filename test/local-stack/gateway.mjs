/**
 * A local stand-in for a Supabase project, for end-to-end verification only.
 * NOT part of the product and never deployed.
 *
 *   /rest/v1/*  -> real PostgREST over the real schema (RLS included)
 *   /auth/v1/*  -> a minimal GoTrue-compatible surface: sign-up, password
 *                  grant, refresh, user, logout. Tokens are real HS256 JWTs
 *                  signed with the same secret PostgREST verifies, so the
 *                  database sees exactly the claims a real project sends.
 */
import { createServer, request as httpRequest } from 'node:http';
import { createHmac, randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const PORT = 54321;
const REST = { host: '127.0.0.1', port: 54322 };
const PG = { host: '127.0.0.1', port: 5433, db: 'deraya_live', user: 'postgres' };
const SEP = String.fromCharCode(31);

const b64 = (buf) => Buffer.from(buf).toString('base64url');

function sign(payload) {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify(payload));
  const sig = createHmac('sha256', SECRET).update(header + '.' + body).digest('base64url');
  return header + '.' + body + '.' + sig;
}

function verify(token) {
  if (!token) return null;
  const [header, body, sig] = token.split('.');
  if (!header || !body || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(header + '.' + body).digest('base64url');
  if (sig !== expected) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp * 1000 < Date.now()) return null;
  return payload;
}

/** psql is the transport: this harness installs no database driver. */
function sql(query) {
  const out = execFileSync(
    'psql',
    ['-h', PG.host, '-p', String(PG.port), '-U', PG.user, '-d', PG.db, '-tAX', '-F', SEP, '-c', query],
    { encoding: 'utf8' },
  ).trim();
  return out ? out.split('\n').map((line) => line.split(SEP)) : [];
}

const escape = (value) => "'" + String(value).replace(/'/g, "''") + "'";

function hash(password) {
  const salt = randomBytes(16).toString('hex');
  return salt + ':' + scryptSync(password, salt, 32).toString('hex');
}

function passwordMatches(password, stored) {
  const [salt, key] = String(stored).split(':');
  if (!salt || !key) return false;
  const actual = scryptSync(password, salt, 32);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function userRecord(row) {
  const [id, email, meta, createdAt] = row;
  return {
    id,
    aud: 'authenticated',
    role: 'authenticated',
    email,
    email_confirmed_at: createdAt,
    confirmed_at: createdAt,
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: JSON.parse(meta || '{}'),
    identities: [],
    created_at: createdAt,
    updated_at: createdAt,
    is_anonymous: false,
  };
}

function session(user) {
  const now = Math.floor(Date.now() / 1000);
  const expires = now + 3600;
  return {
    access_token: sign({
      sub: user.id,
      email: user.email,
      role: 'authenticated',
      aud: 'authenticated',
      iss: 'http://127.0.0.1:' + PORT + '/auth/v1',
      iat: now,
      exp: expires,
      session_id: randomUUID(),
      app_metadata: user.app_metadata,
      user_metadata: user.user_metadata,
    }),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expires,
    refresh_token: sign({ sub: user.id, typ: 'refresh', iat: now, exp: now + 86400 }),
    user,
  };
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'content-length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function findUser(where) {
  const rows = sql(
    'select id, email, raw_user_meta_data::text, created_at from auth.users where ' + where + ' limit 1',
  );
  return rows[0] ?? null;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:' + PORT);

  if (url.pathname.startsWith('/rest/v1')) {
    const proxied = httpRequest(
      {
        ...REST,
        method: req.method,
        path: url.pathname.replace('/rest/v1', '') + url.search,
        headers: { ...req.headers, host: REST.host + ':' + REST.port },
      },
      (upstream) => {
        res.writeHead(upstream.statusCode ?? 500, upstream.headers);
        upstream.pipe(res);
      },
    );
    proxied.on('error', () => json(res, 502, { message: 'rest upstream failed' }));
    req.pipe(proxied);
    return;
  }

  if (!url.pathname.startsWith('/auth/v1')) return json(res, 404, { message: 'not found' });

  const route = url.pathname.replace('/auth/v1', '');
  const body = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : {};
  const bearer = (req.headers.authorization ?? '').replace(/^Bearer /i, '');

  if (route === '/signup' && req.method === 'POST') {
    const { email, password, data } = body;
    if (findUser('email = ' + escape(email))) {
      return json(res, 400, { error_code: 'user_already_exists', msg: 'User already registered' });
    }
    const id = randomUUID();
    sql(
      'insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data) values (' +
        escape(id) + ', ' + escape(email) + ', ' + escape(hash(password)) +
        ', now(), ' + escape(JSON.stringify(data ?? {})) + '::jsonb)',
    );
    return json(res, 200, session(userRecord(findUser('id = ' + escape(id)))));
  }

  if (route === '/token' && req.method === 'POST') {
    const grant = url.searchParams.get('grant_type');

    if (grant === 'password') {
      const row = findUser('email = ' + escape(body.email));
      if (!row) {
        return json(res, 400, { error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      }
      const stored = sql('select encrypted_password from auth.users where id = ' + escape(row[0]))[0][0];
      if (!passwordMatches(body.password, stored)) {
        return json(res, 400, { error_code: 'invalid_credentials', msg: 'Invalid login credentials' });
      }
      return json(res, 200, session(userRecord(row)));
    }

    if (grant === 'refresh_token') {
      const claims = verify(body.refresh_token);
      const row = claims ? findUser('id = ' + escape(claims.sub)) : null;
      if (!row) {
        return json(res, 400, { error_code: 'refresh_token_not_found', msg: 'Invalid refresh token' });
      }
      return json(res, 200, session(userRecord(row)));
    }

    return json(res, 400, { msg: 'unsupported grant' });
  }

  if (route === '/user' && req.method === 'GET') {
    const claims = verify(bearer);
    const row = claims ? findUser('id = ' + escape(claims.sub)) : null;
    if (!row) return json(res, 401, { msg: 'invalid claim: missing sub claim' });
    return json(res, 200, userRecord(row));
  }

  if (route === '/logout') {
    res.writeHead(204);
    res.end();
    return;
  }

  return json(res, 404, { message: 'no route ' + route });
});

server.listen(PORT, () => console.log('gateway on http://127.0.0.1:' + PORT));
