import type { QuizQuestion } from '../types';
import { adv, basic, mid } from './q';

export const quizzes13to16: Record<string, QuizQuestion[]> = {
  'w13-security-read': [
    basic(
      'What are the three parts of a JWT?',
      [
        'Key, value, signature',
        '*Header, payload, signature (base64url, joined with dots)',
        'User, role, expiry',
        'Public key, private key, token',
      ],
      'The header names the algorithm, the payload carries claims, and the signature covers both.',
    ),
    basic(
      "Is a signed JWT's payload encrypted?",
      [
        'Yes, always',
        '*No, it is only base64url-encoded; anyone holding the token can read it',
        'Only with HS256',
        'Only the `sub` claim',
      ],
      'Never put secrets in a JWT payload. The signature only prevents **tampering**.',
    ),
    basic(
      'Authentication vs authorization?',
      [
        '*Authentication: who you are. Authorization: what you are allowed to do',
        'They are synonyms',
        'Authorization comes first',
        'Authentication is only for admins',
      ],
      'Login and the JWT guard are authentication (401). RBAC and ownership checks are authorization (403).',
    ),
    basic(
      'Why bcrypt instead of SHA-256 for passwords?',
      [
        'SHA-256 is broken',
        'bcrypt is reversible',
        '*bcrypt is deliberately slow, salted and has a tunable cost; fast hashes make brute force cheap',
        'bcrypt output is shorter',
      ],
      'GPUs compute billions of SHA-256 hashes per second. bcrypt with cost 10–12 allows only thousands.',
    ),
    mid(
      'Why a short-lived access token **plus** a long-lived refresh token?',
      [
        'To send two tokens per request',
        'Refresh tokens are more secure',
        'JWT requires it',
        "*A leaked access token is only useful briefly, and users don't have to log in again constantly",
      ],
      'Refresh tokens go only to `/auth/refresh` and can be revoked server-side.',
    ),
    mid(
      'What does CORS protect?',
      [
        'Your API from curl and scripts',
        "*Users' browsers: it stops JavaScript on other origins from reading your API's responses unless you allow them",
        'Your database',
        'Against DDoS',
      ],
      'Non-browser clients ignore CORS entirely. It is not an access control mechanism for the API.',
    ),
    mid(
      'What should go into the **access token** payload?',
      ['*The user id', '*The role', '*The expiry (`exp`)', 'The password hash', 'Payment details'],
      'Keep it small and non-sensitive, enough for guards to authorize without a DB lookup.',
    ),
    mid(
      'What is the correct `Authorization` header format?',
      [
        '`Authorization: <token>`',
        '`Authorization: JWT=<token>`',
        '*`Authorization: Bearer <token>`',
        '`Bearer: <token>`',
      ],
      'Anything else must give 401 ("invalid authorization scheme").',
    ),
    adv(
      'Which risk is **#1** in the OWASP Top 10 (2021 edition)?',
      ['Injection', '*Broken Access Control', 'Cross-Site Scripting', 'Security Misconfiguration'],
      "For example, an editor modifying another user's article because ownership isn't checked.",
    ),
    adv(
      'What is refresh token **rotation with reuse detection**?',
      [
        'Changing the JWT secret daily',
        'Using two refresh tokens at once',
        'Refreshing every minute',
        '*Each refresh returns a new refresh token and invalidates the old one; if an old one is used again, assume theft and revoke the whole session',
      ],
      'This needs server-side state (stored token hashes or `jti`s).',
    ),
    adv(
      'Why must the server specify the allowed algorithms when verifying a JWT?',
      [
        'For speed',
        '*Otherwise an attacker can choose the algorithm (`alg: none`, or an RS/HS confusion) and forge tokens',
        'To support refresh tokens',
        "It doesn't matter with HS256",
      ],
      'Libraries like `@nestjs/jwt` let you pin `algorithms` in verify options.',
    ),
    adv(
      'How do you implement "logout" with stateless JWTs?',
      [
        'Delete the token from the JWT',
        "Change the user's role",
        "*Access tokens can't be revoked before `exp`, so keep them short and revoke the **refresh** token server-side (DB row or deny-list)",
        'Logout is impossible',
      ],
      'That is exactly the hacker-scope logout task.',
    ),
  ],

  'w14-testing-read': [
    basic(
      'What does the testing pyramid recommend?',
      [
        '*Many fast unit tests, fewer integration tests, and the fewest end-to-end tests',
        'Mostly end-to-end tests',
        'Equal numbers of each',
        'Only manual testing',
      ],
      'Lower levels are faster, cheaper and more precise when they fail.',
    ),
    basic(
      'What does FIRST stand for?',
      [
        'Functional, Integrated, Reliable, Secure, Typed',
        'Fast, Isolated, Readable, Simple, Tested',
        '*Fast, Independent (Isolated), Repeatable, Self-validating, Timely',
        'Focused, Incremental, Robust, Small, Traceable',
      ],
      'Good unit tests have all five properties.',
    ),
    basic(
      'What is a **unit** test?',
      [
        'A test that runs the whole app',
        'A test of the UI',
        'A load test',
        '*A test of a small piece of code in isolation, with its dependencies replaced',
      ],
      'For example, a service with a mocked repository.',
    ),
    basic(
      'What is an **integration** test?',
      [
        '*A test of several components together, for example the API plus the database',
        'A test of a single function',
        'A manual test',
        'A performance benchmark',
      ],
      "The course's provided Knowledge Hub tests are integration tests.",
    ),
    mid(
      'What makes a test **flaky**?',
      [
        'It is too long',
        'It uses mocks',
        'It tests errors',
        '*It depends on real time, the network, test order or shared state, so it sometimes fails without code changes',
      ],
      'Fix it by controlling time (fake timers), isolating state and mocking external systems.',
    ),
    mid(
      'What does "self-validating" mean?',
      [
        '*The test decides pass or fail by itself, with no human reading the output',
        'It validates its own code',
        'It generates its own data',
        'It checks coverage',
      ],
      'No "look at the console to see if it worked" tests.',
    ),
    mid(
      'Which practices keep tests **independent**?',
      [
        '*Each test creates its own data',
        "*Tests don't rely on execution order",
        '*Fresh instances or cleanup in `beforeEach`',
        'Sharing a mutable global object between tests',
      ],
      'Shared mutable state is the most common cause of order-dependent failures.',
    ),
    mid(
      'What does AAA stand for?',
      ['Assert, Act, Arrange', '*Arrange, Act, Assert', 'Async, Await, Assert', 'All At Again'],
      'Set up, perform one action, verify. A readable structure for every test.',
    ),
    adv(
      'Why avoid testing **implementation details**?',
      [
        'They are always correct',
        '*Such tests break on harmless refactors; test observable behavior through the public API',
        'They are slower',
        'Coverage tools ignore them',
      ],
      "Assert on results and important interactions, not private fields or call order that doesn't matter.",
    ),
    adv(
      'What does 100% line coverage guarantee?',
      [
        'The code is bug-free',
        'All edge cases are tested',
        '*Only that every line ran during tests, not that the assertions checked correct behavior',
        'That branches are covered too',
      ],
      "Coverage shows what is **untested**. It doesn't prove what is correct.",
    ),
  ],

  'w14-jest-read': [
    basic(
      '`toBe` vs `toEqual`?',
      [
        'Same thing',
        '`toEqual` checks identity',
        '*`toBe` uses `Object.is` (identity); `toEqual` compares values recursively',
        '`toBe` is only for strings',
      ],
      '`expect({a:1}).toBe({a:1})` fails. `toEqual` passes.',
    ),
    basic(
      'What is `describe` for?',
      ['*Grouping related tests (and their setup hooks)', 'Skipping tests', 'Mocking modules', 'Printing output'],
      'Hooks like `beforeEach` apply to the `describe` block they are in.',
    ),
    basic(
      'What does `jest.fn()` create?',
      [
        'A real function wrapper',
        'A spy on a module',
        '*A mock function that records its calls and can return configured values',
        'A test case',
      ],
      'Check calls with `toHaveBeenCalledWith(...)`.',
    ),
    basic(
      'When does `beforeEach` run?',
      ['Once before all tests', '*Before every test in its scope', 'After every test', 'Only when a test fails'],
      '`beforeAll` runs once. Use `beforeEach` to keep tests independent.',
    ),
    mid(
      'How do you assert that an async function **rejects**?',
      [
        '*`await expect(fn()).rejects.toThrow(MyError)`',
        '`expect(fn()).toThrow()`',
        '`expect(await fn()).toThrow()`',
        '`fn().catch(expect)`',
      ],
      '`toThrow` without `rejects` works only for synchronous throws. `await expect(fn())` would throw before the assertion.',
    ),
    mid(
      'What does `jest.spyOn(obj, "method")` do?',
      [
        'Replaces the whole module',
        'Deletes the method',
        'Makes the method async',
        '*Wraps the existing method to record calls; you can change its implementation and restore it',
      ],
      'Example: `jest.spyOn(account, "fetchBalance").mockResolvedValueOnce(50)`.',
    ),
    mid(
      'Why use `jest.requireActual` inside a `jest.mock` factory?',
      [
        "*To keep the real implementation of the exports you don't want to mock (partial mocking)",
        'To make mocks faster',
        'It is required by Jest',
        'To load the module twice',
      ],
      '`{ ...jest.requireActual("./index"), mockOne: jest.fn() }`.',
    ),
    mid(
      'Which are matchers for **numbers**?',
      ['*`toBeGreaterThan`', '*`toBeCloseTo`', '`toHaveBeenCalled`', '*`toBeLessThanOrEqual`'],
      '`toBeCloseTo` avoids floating-point problems like `0.1 + 0.2`.',
    ),
    adv(
      'How do you test code that uses `setTimeout(cb, 1000)` without waiting a second?',
      [
        'Set the timeout to 0',
        '*`jest.useFakeTimers()`, then `jest.advanceTimersByTime(1000)`',
        'Mock `Date.now`',
        'Use `await sleep(1000)`',
      ],
      'Fake timers make time-based tests fast and deterministic.',
    ),
    adv(
      'How does `toStrictEqual` differ from `toEqual`?',
      [
        'It is faster',
        '*It also checks `undefined` properties, array sparseness and that object classes match',
        'It compares references',
        'It ignores key order',
      ],
      '`{a: undefined, b: 2}` equals `{b: 2}` with `toEqual`, but not with `toStrictEqual`.',
    ),
    adv(
      'What is wrong with this test?\n\n~~~js\ntest("rejects", () => {\n  expect(Promise.reject(new Error("x"))).rejects.toThrow("y");\n});\n~~~',
      [
        'Nothing, it fails as expected',
        '`rejects` only works with async functions',
        'The error message must be a regex',
        '*The assertion promise is neither awaited nor returned, so the test can finish (and pass) before the check runs',
      ],
      'Always `await` or `return` async expectations.',
    ),
  ],

  'w15-unit-read': [
    basic(
      'Stub vs mock?',
      [
        'Same thing',
        '*A stub returns canned answers; a mock also verifies how it was called',
        'A mock is a real object',
        'A stub records calls',
      ],
      "Fowler's distinction: stubs support state verification, mocks support behavior verification.",
    ),
    basic(
      'How do you replace a repository in a Nest testing module?',
      [
        '*`{ provide: USER_REPOSITORY, useValue: mockRepo }`, or `.overrideProvider(token).useValue(mockRepo)`',
        'Edit the real module',
        'Use `new UserService(mockRepo)` only',
        "It isn't possible",
      ],
      'Direct `new` also works for simple services, but the testing module exercises the DI wiring too.',
    ),
    basic(
      'What does `vi.fn()` create in Vitest?',
      ['A real function', '*A mock function, the equivalent of `jest.fn()`', 'A spy on a module', 'A test suite'],
      'The Vitest API is largely Jest-compatible: `mockResolvedValue`, `toHaveBeenCalledWith`, and so on.',
    ),
    basic(
      "What must **not** happen in this assignment's unit tests?",
      ['Using mocks', 'Using `@nestjs/testing`', '*Real database calls or HTTP requests', 'Testing guards'],
      'Real DB and HTTP belong to integration tests.',
    ),
    mid(
      'Why is an SWC plugin (for example `unplugin-swc`) used to run Nest tests in Vitest?',
      [
        'SWC is required for coverage',
        'It makes tests synchronous',
        "Vitest can't run TypeScript",
        "*Vitest's default esbuild transform doesn't emit decorator metadata, which Nest DI needs",
      ],
      'Without `emitDecoratorMetadata`, constructor injection by type breaks.',
    ),
    mid(
      "How do you unit-test a guard's `canActivate`?",
      [
        'Start the HTTP server',
        "Guards can't be unit-tested",
        '*Build a fake `ExecutionContext` whose `switchToHttp().getRequest()` returns your request object',
        'Use Swagger',
      ],
      'Also stub `getHandler`/`getClass` and mock `Reflector` for metadata.',
    ),
    mid(
      'What does `vi.mock("bcryptjs")` do?',
      [
        'Mocks one function',
        '*Replaces the whole module with automocks; the call is hoisted above imports',
        'Spies without replacing',
        'Installs bcryptjs',
      ],
      'Hoisting means the mock is in place before the module under test imports it.',
    ),
    mid(
      'What is worth asserting on mocks?',
      [
        '*That they were called with the right arguments',
        '*How many times they were called',
        '*That their return value was used correctly',
        'The private field names of the service',
      ],
      'Assert the interactions that matter for behavior, not internals.',
    ),
    adv(
      'What happens when coverage is below the configured thresholds?',
      [
        'A warning only',
        '*`vitest run --coverage` exits non-zero, so CI fails',
        'The thresholds are lowered automatically',
        'The tests are skipped',
      ],
      'That is the "must exit with a non-zero code" requirement.',
    ),
    adv(
      'What is the main risk of **over-mocking**?',
      [
        'Tests are slow',
        "*Tests pass while the real parts don't fit together, because mocks encode wrong assumptions",
        'Coverage drops',
        'Mocks leak memory',
      ],
      'That is why unit tests here complement, not replace, the integration suite.',
    ),
  ],

  'w16-logging-read': [
    basic(
      'Operational vs programmer errors?',
      [
        'Same thing',
        'Operational errors are bugs',
        '*Operational: expected runtime failures (network down, invalid input). Programmer: bugs (undefined is not a function)',
        'Programmer errors come from users',
      ],
      'Handle operational errors gracefully. Programmer errors leave the process in an unknown state.',
    ),
    basic(
      'With `LOG_LEVEL=warn`, which messages are output?',
      ['All of them', '*`error` and `warn`', 'Only `warn`', '`warn`, `log` and `debug`'],
      'The level is a minimum severity: error > warn > log > debug > verbose.',
    ),
    basic(
      'Why use structured JSON logs in production?',
      [
        'They are shorter',
        'They are more readable for humans',
        'Nest requires it',
        '*Log tools can parse, index, filter and aggregate them',
      ],
      'In development, human-readable colored output is nicer.',
    ),
    basic(
      'Which must **never** appear in logs?',
      ['The HTTP method', 'The response time', '*The `Authorization` header value', 'The request URL path'],
      'Tokens and passwords in logs are a security incident. Redact them.',
    ),
    mid(
      'What should a process do after `uncaughtException`?',
      [
        '*Log the error, shut down gracefully and exit (a supervisor restarts it)',
        'Ignore it and continue',
        'Retry the last request',
        'Restart the event loop',
      ],
      'After an uncaught exception, application state may be corrupted.',
    ),
    mid(
      'What happens by default on an **unhandled promise rejection** in modern Node (15+)?',
      [
        'A warning only',
        '*It is raised as an uncaught exception and the process exits',
        'Nothing',
        'The promise is retried',
      ],
      '`--unhandled-rejections=throw` is the default since Node 15.',
    ),
    mid(
      'Which are good logging practices?',
      [
        '*Include a request or correlation id',
        '*Log errors with their stack trace',
        'Log full request bodies including passwords',
        '*Use levels appropriately',
      ],
      'Correlation ids let you follow one request through all its log lines.',
    ),
    mid(
      'What happens here?\n\n~~~js\ntry {\n  setTimeout(() => { throw new Error("x"); }, 0);\n} catch (e) {\n  console.log("caught");\n}\n~~~',
      [
        'Prints "caught"',
        'Nothing happens',
        '*The error is not caught: the callback runs later on a different stack, so it becomes an `uncaughtException`',
        'Node retries the timer',
      ],
      'try/catch only covers synchronous code and `await`ed promises.',
    ),
    adv(
      'What is a correct graceful shutdown order?',
      [
        'Exit immediately, then close the DB',
        'Close the DB, then stop accepting requests',
        '*Stop accepting new connections → finish in-flight requests → close DB connections → exit',
        'Kill the workers first',
      ],
      'Add a forced-exit timeout in case something hangs.',
    ),
    adv(
      '`g()` returns a rejected promise. What does `f()` do?\n\n~~~js\nasync function f() {\n  try {\n    return g();\n  } catch {\n    return "caught";\n  }\n}\n~~~',
      [
        'Resolves to "caught"',
        "*Rejects with g's error: without `await`, the rejection happens after the try block has finished",
        'Resolves to undefined',
        'Throws synchronously',
      ],
      'Use `return await g();` inside try/catch. This is one of the few places where `return await` matters.',
    ),
    adv(
      'An unexpected error happens in a handler. What should the 500 response contain?',
      [
        'The stack trace, for debugging',
        'The SQL query that failed',
        '*A generic message; the details (stack, context) go only to the logs',
        'Nothing, close the socket',
      ],
      'Leaking internals helps attackers. The assignment specifies "An unexpected error occurred".',
    ),
  ],
};
