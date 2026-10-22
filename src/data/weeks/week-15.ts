import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

const PROJECT = 'w15-rest-testing';

export const week15: Week = {
  id: 'w15',
  number: 15,
  programWeek: 8,
  title: 'Unit testing a Nest.js API with Vitest',
  short: 'Vitest unit tests',
  goals: [
    'Test Nest providers in isolation with @nestjs/testing',
    'Mock the data layer and external dependencies with vi.fn / vi.mock / vi.spyOn',
    'Test guards, pipes, interceptors, filters and DTOs',
    'Reach 90% lines / 85% branches coverage with enforced thresholds',
  ],
  modules: [programModule('rest/testing', 'REST service: Testing')],
  tasks: [
    {
      id: 'w15-unit-read',
      kind: 'read',
      title: 'Unit testing strategy & test doubles',
      summary: 'Nest testing utilities, Vitest, mocks vs stubs vs fakes.',
      estimateH: 2,
      resources: [
        { title: 'Nest: testing', url: 'https://docs.nestjs.com/fundamentals/testing' },
        { title: 'Vitest guide', url: 'https://vitest.dev/guide/' },
        { title: 'Vitest: mocking', url: 'https://vitest.dev/guide/mocking' },
        { title: 'Vitest: coverage', url: 'https://vitest.dev/guide/coverage' },
        { title: "Martin Fowler: Mocks aren't stubs", url: 'https://martinfowler.com/articles/mocksArentStubs.html' },
      ],
      questions: [
        'Stub vs mock vs fake vs spy?',
        'How do you override a provider in `Test.createTestingModule` (`useValue`, `overrideProvider`)?',
        'Nest relies on decorator metadata. What does Vitest need for that (SWC plugin, `emitDecoratorMetadata`)?',
        'How do you build an `ExecutionContext` by hand to unit-test a guard?',
      ],
    },
    {
      id: 'w15-vitest-nest-setup',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: first Nest service test in Vitest',
      summary: 'Get decorators and DI working under Vitest.',
      estimateH: 1,
      description: `\`npm i -D vitest @vitest/coverage-v8 unplugin-swc @swc/core\`, then create \`vitest.config.ts\`:
~~~ts
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  plugins: [swc.vite()],
  test: { globals: true, include: ['src/**/*.unit.spec.ts'] },
});
~~~
Write one test for \`CategoryService.findOne\`: the repository is mocked with \`useValue: { findById: vi.fn() }\`, and it returns the entity or throws \`NotFoundException\`.`,
      run: 'npx vitest run',
      acceptance: ['The test passes with DI working', 'Breaking the service makes it fail'],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: REST service testing (Vitest)',
      summary: 'Unit tests for services, guards, pipes, interceptors, filters and DTOs with coverage thresholds.',
      estimateH: 1,
      ...assignment('08a-testing'),
      overview: `${KH_REPO_NOTE}

The course already provides **integration** tests. This assignment is only about **unit** tests: every dependency mocked, no DB, no HTTP.`,
      requirements: [
        'Vitest + `@nestjs/testing`; Node.js 24.x (24.10.0+)',
        'No real database calls or HTTP requests in unit tests',
        'Unit tests are separate from integration tests (`*.unit.spec.ts` or `src/__tests__/unit/`)',
        ...PR_RULES,
      ],
      spec: `### What to test
| Area | Cases |
|---|---|
| **User service** | signup validation, password hashing, role assignment, user not found, duplicate login |
| **Article service** | creation validation, status transitions \`draft → published → archived\`, invalid transitions, tag management, filtering (status/categoryId/tag) |
| **Auth service** | token generation, verification, refresh rotation, expired/invalid tokens, RBAC checks |
| **JwtAuthGuard** | valid token passes; missing, malformed or expired → \`UnauthorizedException\` |
| **RolesGuard** | right role passes; wrong role → \`ForbiddenException\`; no \`@Roles()\` → default |
| **Pipes** | ParseUUID (or equivalent): valid passes, invalid → \`BadRequestException\` |
| **Interceptors / filters** | password stripped from output; correct status and error shape |
| **DTOs** | \`validate()\` from class-validator: missing fields, bad enums, valid payload |

### Edge cases to cover explicitly
Malformed UUIDs · missing required fields · duplicate login · expired or tampered JWT · role-forbidden operations · non-existent resources

### Scripts & config
- \`npm run test\` (all), \`npm run test:unit\`, \`npm run test:coverage\`
- \`vitest.config.ts\` with **thresholds: lines ≥ 90, branches ≥ 85**. Coverage below that → non-zero exit`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** each: User service · Article service · Auth service · Guards',
            '**+6** Pipes · **+6** DTO validation',
            '**+10** Vitest config and the 3 scripts',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+20** coverage thresholds met',
            '**+10** data layer mocked everywhere',
            '**+10** edge cases covered',
            '**+10** interceptors/filters covered',
          ],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: [
        'Unit test files + vitest.config.ts',
        'A coverage summary in the PR description',
        'PR with self-score',
      ],
    },
    {
      id: 'w15-config-scripts',
      kind: 'code',
      title: 'Vitest config, scripts and thresholds',
      summary: 'test, test:unit, test:coverage with enforced thresholds.',
      estimateH: 1,
      projectId: PROJECT,
      points: 10,
      description: `Add scripts:
~~~json
"test:unit": "vitest run --project unit",
"test:coverage": "vitest run --coverage"
~~~
Set \`coverage: { provider: 'v8', include: ['src/**/*.ts'], exclude: ['src/main.ts', '**/*.module.ts', '**/*.dto.ts'], thresholds: { lines: 90, branches: 85 } }\`. Use Vitest projects (or separate configs) so the integration tests and unit tests can run separately.`,
      run: 'npm run test:coverage; echo "exit: $?"',
      acceptance: ['All 3 scripts work', 'Coverage below the threshold exits non-zero'],
    },
    {
      id: 'w15-user-service',
      kind: 'code',
      title: 'User service tests',
      summary: 'Hashing, roles, not found, duplicates.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Mock the user repository and `bcrypt` (`vi.mock("bcryptjs")`). Cover: create hashes the password (the stored value ≠ the plain one), the default role is viewer, a duplicate login throws, `findOne` on a missing id throws `NotFoundException`, password change with a wrong old password → `ForbiddenException`.',
      acceptance: ['No real hashing or DB', 'Every branch of the service is covered'],
    },
    {
      id: 'w15-article-service',
      kind: 'code',
      title: 'Article service tests',
      summary: 'Status transitions, tags, filtering.',
      estimateH: 2,
      projectId: PROJECT,
      points: 10,
      description:
        "If you haven't already, add an explicit transition rule (`draft → published → archived`; anything else, such as `archived → draft`, is rejected) and test it with `it.each`. Test tag handling (`connectOrCreate` payload built correctly) and that filter params turn into the right `where` object.",
      acceptance: [
        'Valid and invalid transitions are table-tested',
        'Filter → `where` mapping is asserted with `toHaveBeenCalledWith`',
      ],
    },
    {
      id: 'w15-auth-service',
      kind: 'code',
      title: 'Auth service tests',
      summary: 'Tokens, refresh rotation, RBAC helper.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Use a real `JwtService` with a test secret (it is pure, no I/O) or a mocked one. Cover: login returns two tokens with the right payload, wrong password → 403, refresh with a valid token returns a new pair, an expired token (sign with `expiresIn: -1` or use fake timers) and a tampered token → errors, plus any `canEdit(user, article)` helper.',
      acceptance: ['Expired and tampered tokens are both covered'],
    },
    {
      id: 'w15-guards',
      kind: 'code',
      title: 'Guard tests: JwtAuthGuard & RolesGuard',
      summary: 'Build an ExecutionContext by hand.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description: `Build a helper:
~~~ts
const ctx = (headers = {}, user?) => ({
  switchToHttp: () => ({ getRequest: () => ({ headers, user }) }),
  getHandler: () => () => {}, getClass: () => class {},
}) as unknown as ExecutionContext;
~~~
Mock \`Reflector.getAllAndOverride\` to simulate \`@Public()\` and \`@Roles()\`.`,
      acceptance: [
        'Valid, missing, non-Bearer, expired and public cases for the JWT guard',
        'Allowed, forbidden and no-metadata cases for the RolesGuard',
      ],
    },
    {
      id: 'w15-pipes-dto',
      kind: 'code',
      title: 'Pipe and DTO validation tests',
      summary: 'class-validator directly, no HTTP.',
      estimateH: 1,
      projectId: PROJECT,
      points: 12,
      description:
        'For DTOs: `const dto = plainToInstance(CreateArticleDto, payload); const errors = await validate(dto);`, then assert which properties have errors. Cover a missing title, `status: "nope"` and a valid payload. For pipes: `new ParseUUIDPipe().transform("bad", meta)` rejects with `BadRequestException`.',
      acceptance: ['At least 3 DTOs tested', 'Invalid enum values are covered'],
    },
    {
      id: 'w15-interceptors-filters',
      kind: 'code',
      title: 'Interceptor & filter tests',
      summary: 'Password stripping and error shape.',
      estimateH: 1,
      projectId: PROJECT,
      points: 10,
      description:
        'Interceptor: give it a `CallHandler` whose `handle()` returns `of({ id, login, password })` and assert the emitted value has no `password` (for arrays too). Filter: mock `ArgumentsHost` with a response whose `status` returns `{ json: vi.fn() }`, and assert the status code and body shape for `HttpException` and for an unknown `Error`.',
      acceptance: ['Arrays and single objects are both covered', 'An unknown error maps to 500'],
    },
    {
      id: 'w15-coverage',
      kind: 'code',
      title: 'Reach the coverage thresholds',
      summary: '≥ 90% lines, ≥ 85% branches, all edge cases covered.',
      estimateH: 2,
      projectId: PROJECT,
      points: 40,
      description:
        'Run coverage, open `coverage/index.html` and work through the uncovered branches. Go through the edge-case list in the project spec and make sure each one has an explicit test with a descriptive name.',
      run: 'npm run test:coverage && open coverage/index.html',
      acceptance: [
        'Thresholds met (exit 0)',
        'Each edge case from the spec is easy to find by test name',
        'Integration tests are still green',
      ],
    },
    {
      id: 'w15-testing-ship',
      kind: 'code',
      title: 'Ship & self-score: Testing',
      summary: 'Coverage summary in the PR.',
      estimateH: 0.5,
      projectId: PROJECT,
      description: 'Paste the coverage summary table into the PR description, along with your self-score.',
      acceptance: ['Self-score written down'],
    },
  ],
};
