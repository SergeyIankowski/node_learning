import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

const PROJECT = 'w13-auth';

export const week13: Week = {
  id: 'w13',
  number: 13,
  programWeek: 7,
  title: 'Authentication, JWT, RBAC & web security',
  short: 'Auth & JWT',
  goals: [
    'Explain authentication vs authorization, and the trade-offs of tokens vs sessions',
    'Hash passwords with bcrypt and issue access + refresh JWTs',
    'Protect routes with a global guard and role-based access control',
    'Know the OWASP Top 10 and CORS basics',
  ],
  modules: [programModule('rest/authentication-jwt', 'REST service: Authentication & Authorization')],
  tasks: [
    {
      id: 'w13-security-read',
      kind: 'read',
      title: 'Auth, JWT, OWASP Top 10, CORS',
      summary: "Theory for this week's project.",
      estimateH: 3,
      resources: [
        {
          title: 'Lecture: Authentication, JWT and Security',
          url: 'https://www.youtube.com/watch?v=K0K4bCQAfUM',
          lang: 'RU',
        },
        { title: 'Introduction to JSON Web Tokens', url: 'https://jwt.io/introduction' },
        { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
        { title: 'MDN: CORS', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' },
        {
          title: 'Passport: authentication strategies',
          url: 'https://www.passportjs.org/concepts/authentication/strategies/',
        },
        { title: 'Nest: authentication', url: 'https://docs.nestjs.com/security/authentication' },
        { title: 'Nest: authorization (RBAC)', url: 'https://docs.nestjs.com/security/authorization' },
        { title: 'Nest: rate limiting', url: 'https://docs.nestjs.com/security/rate-limiting' },
      ],
      questions: [
        'What are the three parts of a JWT? Is the payload encrypted?',
        'Why have a short-lived access token **and** a long-lived refresh token? What is refresh token rotation?',
        'Why bcrypt instead of sha256 for passwords? What are the salt and the cost factor?',
        'Which OWASP Top 10 items apply directly to this API (Broken Access Control, Injection, Auth Failures…)?',
        "CORS protects whom from what? Why doesn't it secure your API against curl?",
      ],
    },
    {
      id: 'w13-jwt-by-hand',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: sign and verify an HS256 JWT by hand',
      summary: 'No library: just base64url and HMAC.',
      estimateH: 1,
      description: `Write \`jwt.mjs\` with only \`node:crypto\`:
- \`sign(payload, secret, ttlSec)\` → \`base64url(header).base64url(payload).base64url(HMAC-SHA256(…))\` with \`iat\`/\`exp\`
- \`verify(token, secret)\` → recompute the signature, compare it with \`crypto.timingSafeEqual\`, check \`exp\`, return the payload or throw

Paste your token into jwt.io and check it decodes. Then change one character of the payload. \`verify\` must throw.`,
      run: 'node jwt.mjs',
      acceptance: [
        'jwt.io shows a valid signature with your secret',
        'A tampered or expired token throws',
        'Uses `timingSafeEqual`',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Authentication & Authorization',
      summary: 'Signup/login/refresh with bcrypt and JWT, a global auth guard, RBAC, rate limiting, logout.',
      estimateH: 1,
      ...assignment('07a-auth-jwt'),
      overview: `${KH_REPO_NOTE}

Add JWT authentication (access + refresh tokens) and role-based authorization to the Knowledge Hub API.`,
      requirements: [
        'TypeScript; Node.js 24.x (24.10.0+)',
        '`bcrypt` or `bcryptjs` for password hashing (`bcryptjs` avoids native build issues)',
        'Secrets and TTLs in `.env`',
        ...PR_RULES,
      ],
      spec: `### Endpoints
| Route | Body | Responses |
|---|---|---|
| \`POST /auth/signup\` | \`{ login, password }\` | **201** · **400** invalid dto or login taken |
| \`POST /auth/login\` | \`{ login, password }\` | **200** \`{ accessToken, refreshToken }\` · **400** invalid dto · **403** wrong credentials |
| \`POST /auth/refresh\` | \`{ refreshToken }\` | **200** new pair · **401** no token in body · **403** invalid or expired |
| \`POST /auth/logout\` (hacker) | \`{ refreshToken }\` | invalidates the refresh token |

### Rules
- Passwords are stored as a **bcrypt hash** and stay hashed after every operation (including \`PUT /user/:id\`)
- The access token payload has \`userId\`, \`login\`, \`role\`. TTL about 15m. Refresh TTL about 7d
- Every route except \`/auth/signup\`, \`/auth/login\`, \`/auth/refresh\`, \`/doc\` and \`/\` requires \`Authorization: Bearer <token>\`. Missing, invalid, non-Bearer or expired → **401**
- **RBAC**: \`viewer\` can only GET. \`editor\` can also POST/PUT **their own** articles and comments, but can't delete others' content or manage categories. \`admin\` can do everything. Forbidden → **403**
- Signup creates \`viewer\` by default. Only admins can change roles

### .env
~~~
JWT_SECRET=…
JWT_REFRESH_SECRET=…
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
~~~`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+20** signup · **+20** login · **+10** bcrypt hashes in the DB',
            '**+20** access token with userId/login/role, secret in .env',
            '**+30** auth required on all routes except the public ones (guard or middleware)',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+26** refresh (200/401/403)',
            '**+16** descriptive 401 for expired/invalid tokens',
            '**+10** RBAC with 403',
          ],
        },
        {
          scope: 'Hacker',
          items: ['**+10** rate limiting on signup/login per IP', '**+10** logout invalidates the refresh token'],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: [
        'AuthModule, guards, decorators',
        'Updated README (how to get a token, roles)',
        'PR with self-score',
      ],
    },
    {
      id: 'w13-signup',
      kind: 'code',
      title: 'Signup with bcrypt',
      summary: 'Hash on create and on password change, never store plain text.',
      estimateH: 1,
      projectId: PROJECT,
      points: 30,
      description:
        'Create `AuthModule` with `POST /auth/signup` and `SignupDto { @IsString() @IsNotEmpty() login, password }`. A taken login → **400**. Hash with `bcrypt.hash(password, 10)`. Update `PUT /user/:id` to compare with `bcrypt.compare` and store the hash of the new password.',
      run: 'curl -i -X POST localhost:4000/auth/signup -H "content-type: application/json" -d \'{"login":"bob","password":"secret"}\'',
      acceptance: [
        'The DB holds `$2b$10$…` hashes only (check in Studio)',
        'Duplicate login → 400',
        'New users have role `viewer`',
      ],
    },
    {
      id: 'w13-login',
      kind: 'code',
      title: 'Login: access + refresh tokens',
      summary: '@nestjs/jwt with separate secrets and TTLs.',
      estimateH: 1,
      projectId: PROJECT,
      points: 40,
      description:
        '`npm i @nestjs/jwt`. On login: find the user, run `bcrypt.compare`, and on failure return **403** (the same message whether the login or the password is wrong). Sign the access token `{ userId, login, role }` with `JWT_SECRET` / `JWT_ACCESS_TTL`, and the refresh token with `JWT_REFRESH_SECRET` / `JWT_REFRESH_TTL`.',
      run: 'curl -s -X POST localhost:4000/auth/login -H "content-type: application/json" -d \'{"login":"bob","password":"secret"}\'',
      expected: '{"accessToken":"eyJ…","refreshToken":"eyJ…"}',
      acceptance: [
        'The payload contains `userId`, `login`, `role` (check on jwt.io)',
        'Wrong credentials → 403, bad dto → 400',
      ],
    },
    {
      id: 'w13-auth-guard',
      kind: 'code',
      title: 'Global JWT guard + @Public()',
      summary: 'Everything protected by default.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 46,
      description: `- \`JwtAuthGuard\` registered globally (\`APP_GUARD\`). It parses \`Authorization\`, requires the \`Bearer\` scheme and calls \`jwtService.verifyAsync\`, then sets \`request.user\`
- A \`@Public()\` decorator (\`SetMetadata\`) on signup, login, refresh, \`/\` and \`/doc\`. Make sure Swagger stays reachable
- Error messages: "Missing Authorization header", "Invalid authorization scheme", "Access token expired", "Invalid access token" → **401**`,
      run: 'curl -i localhost:4000/article\ncurl -i localhost:4000/article -H "Authorization: Bearer $TOKEN"',
      expected: 'HTTP/1.1 401 Unauthorized …\nHTTP/1.1 200 OK …',
      acceptance: ['Protected by default', 'Public routes stay public', 'A descriptive 401 for each failure kind'],
    },
    {
      id: 'w13-refresh',
      kind: 'code',
      title: 'Refresh endpoint',
      summary: 'Verify the refresh token, issue a new pair.',
      estimateH: 1,
      projectId: PROJECT,
      points: 26,
      description:
        '`POST /auth/refresh { refreshToken }`: missing → **401**. Invalid or expired (verify with `JWT_REFRESH_SECRET`) → **403**. Otherwise re-read the user (their role might have changed) and return a new pair. Bonus: rotation, where each refresh token can be used only once (store a hash or `jti`).',
      acceptance: [
        '401 vs 403 exactly as specified',
        "An access token can't be used as a refresh token (different secret)",
      ],
    },
    {
      id: 'w13-rbac',
      kind: 'code',
      title: 'RBAC: RolesGuard + ownership checks',
      summary: 'viewer = read-only, editor = own content, admin = everything.',
      estimateH: 2,
      projectId: PROJECT,
      points: 10,
      description: `- \`@Roles(UserRole.ADMIN, UserRole.EDITOR)\` + \`RolesGuard\` (\`Reflector\`) for coarse checks per route
- Ownership is checked in the **service**: an editor updating an article whose \`authorId !== user.userId\` → \`ForbiddenException\`
- Category create/update/delete: admin only. Role change on users: admin only
- Without \`@Roles\`: GET is allowed for everyone authenticated, and other methods need at least editor`,
      acceptance: [
        'A viewer POST → 403',
        "An editor editing someone else's article → 403",
        'An admin can do everything',
        'Integration tests still pass (log in with the provided test users if the tests require it)',
      ],
    },
    {
      id: 'w13-rate-limit-logout',
      kind: 'code',
      title: 'Hacker scope: rate limiting + logout',
      summary: '@nestjs/throttler on auth routes, refresh token invalidation.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 20,
      description:
        '`@nestjs/throttler` with `@Throttle({ default: { limit: 5, ttl: 60_000 } })` on signup and login, which gives **429** after 5 requests per minute per IP. For logout, store refresh tokens (hashed) in a `RefreshToken` table or a deny-list keyed by `jti`. `POST /auth/logout` deletes the token, and refresh then checks it is still present.',
      acceptance: ['The 6th login within a minute → 429', 'A refresh after logout → 403'],
    },
    {
      id: 'w13-auth-ship',
      kind: 'code',
      title: 'Ship & self-score: Auth',
      summary: 'Postman flow: signup → login → call → refresh → logout.',
      estimateH: 0.5,
      projectId: PROJECT,
      description:
        'Build a Postman collection that stores the tokens in variables (a test script: `pm.collectionVariables.set("access", pm.response.json().accessToken)`). Run the full flow for each role. Document it in the README and open the PR.',
      acceptance: ['Self-score written down', 'README explains how to authenticate'],
    },
  ],
};
