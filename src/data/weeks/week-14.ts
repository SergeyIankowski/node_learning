import { assignment, programModule } from '../links';
import type { CodeTask, Week } from '../types';

const PROJECT = 'w14-basic-testing';

const step = (id: string, title: string, summary: string, description: string, hints?: string[]): CodeTask => ({
  id: `w14-${id}`,
  kind: 'code',
  title,
  summary,
  estimateH: 1,
  projectId: PROJECT,
  description,
  run: `npm run test -- src/${id}`,
  acceptance: [
    'All test cases in the folder are implemented (no `test.todo` / empty bodies left)',
    'Tests pass, and **fail** if you break the code under test (try it!)',
    'No linter or TypeScript errors; each test finishes in < 30 s',
  ],
  hints,
});

export const week14: Week = {
  id: 'w14',
  number: 14,
  programWeek: 7,
  title: 'Testing basics with Jest',
  short: 'Jest basics',
  goals: [
    'Know the testing pyramid and the FIRST principles',
    'Use matchers, table tests, async tests and error assertions',
    'Mock modules and Node APIs, use fake timers, and partially mock modules',
  ],
  modules: [programModule('testing', 'Testing basics')],
  tasks: [
    {
      id: 'w14-testing-read',
      kind: 'read',
      title: 'Why and what to test',
      summary: 'Testing pyramid, FIRST, unit vs integration vs e2e.',
      estimateH: 1,
      resources: [
        { title: 'Lecture: Testing basics', url: 'https://youtu.be/ab_QJ52Z-fs', lang: 'RU' },
        {
          title: 'Testing pyramid simplified',
          url: 'https://www.headspin.io/blog/the-testing-pyramid-simplified-for-one-and-all',
        },
        { title: 'Unit testing in JavaScript', url: 'https://www.browserstack.com/guide/unit-testing-in-javascript' },
        {
          title: 'FIRST principles for tests',
          url: 'https://dzone.com/articles/first-principles-solid-rules-for-tests',
        },
      ],
      questions: [
        'What do the letters in FIRST stand for?',
        'Why should most tests be unit tests?',
        'What makes a test flaky, and how do you fix it?',
      ],
    },
    {
      id: 'w14-jest-read',
      kind: 'read',
      title: 'Jest API',
      summary: 'Matchers, mocks, async code, table tests.',
      estimateH: 2,
      resources: [
        { title: 'Jest: getting started', url: 'https://jestjs.io/docs/getting-started' },
        { title: 'Jest: matchers', url: 'https://jestjs.io/docs/using-matchers' },
        { title: 'Jest: mock functions', url: 'https://jestjs.io/docs/mock-functions' },
        { title: 'Jest: testing asynchronous code', url: 'https://jestjs.io/docs/asynchronous' },
        { title: 'Jest: timer mocks', url: 'https://jestjs.io/docs/timer-mocks' },
        { title: 'Jest: snapshot testing', url: 'https://jestjs.io/docs/snapshot-testing' },
        {
          title: 'Jest: test.each (table-driven tests)',
          url: 'https://jestjs.io/docs/api#testeachtablename-fn-timeout',
        },
      ],
      questions: [
        '`toBe` vs `toEqual` vs `toStrictEqual`?',
        'How do you assert that an async function rejects? (`await expect(fn()).rejects.toThrow(...)`)',
        '`jest.fn` vs `jest.spyOn` vs `jest.mock`?',
        'How do `jest.requireActual` and partial mocking work together?',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Basic testing (Jest)',
      summary: 'Write unit tests for 8 prepared modules, from simple asserts to mocking libraries.',
      estimateH: 0.5,
      ...assignment('07b-basic-testing'),
      starterRepo: 'https://github.com/AlreadyBored/basic-testing',
      overview: `Fork the \`basic-testing\` repository. Each folder in \`src/\` contains an \`index.ts\` with code and an \`index.test.ts\` with **empty test cases**. Your job is to implement the test cases.

Unlike the other projects, you don't submit a PR to the original repository. Work in your fork and follow its README.`,
      requirements: [
        'Node.js 24.x (24.10.0+)',
        'Each test is limited to 30 seconds',
        'No linter or TypeScript compiler errors',
        "Don't modify the code under test, only the tests",
      ],
      spec: `| Folder | What you practise |
|---|---|
| \`01-simple-tests\` | \`simpleCalculator\`: +, −, ×, ÷, exponent, \`null\` for invalid input |
| \`02-table-tests\` | Rewrite 01 with \`test.each\` |
| \`03-error-handling-async\` | Resolved values, thrown errors, rejected promises, custom errors |
| \`04-test-class\` | A \`BankAccount\` class: balance, deposits, withdrawals, transfers, errors |
| \`05-partial-mocking\` | Mock some exports of a module, keep the rest (\`jest.requireActual\`) |
| \`06-mocking-node-api\` | Fake timers (\`setTimeout\`, \`setInterval\`), mock \`fs\` and \`path\` |
| \`07-mocking-lib-api\` | Mock \`axios\` and \`lodash\` (\`throttle\`) |
| \`08-snapshot-testing\` | \`toMatchSnapshot\` / \`toStrictEqual\` for a linked-list generator |

Scripts: \`npm run test\` and \`npm run test:verbose\`.`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+6** for each test case implemented correctly',
            '**+4** for each test case implemented incorrectly',
          ],
        },
        { scope: 'Forfeits', items: ['**−30% of total score** commits after the deadline'] },
      ],
      deliverables: ['Your fork with every test case implemented', '`npm run test` is all green'],
    },
    step(
      '01-simple-tests',
      '01: simple tests',
      'expect + matchers for a calculator.',
      'Test `simpleCalculator` for each action and for invalid input (non-number arguments, unknown action → `null`). One `test` per case.',
    ),
    step(
      '02-table-tests',
      '02: table tests',
      'The same cases via test.each.',
      'Rewrite 01 with `test.each([{ a, b, action, expected }, …])("$a $action $b = $expected", …)`. Cover every action plus the invalid cases in the table.',
    ),
    step(
      '03-error-handling-async',
      '03: errors and async',
      'resolves, rejects, toThrow, custom errors.',
      'Test that the function resolves with the value, throws with a provided or default message, throws the custom error class, and that the async function rejects.',
      [
        '`await expect(promise).rejects.toThrow(MyError)`. Remember the `await`, or the test passes without checking anything.',
      ],
    ),
    step(
      '04-test-class',
      '04: testing a class',
      'BankAccount: state, errors, mocked randomness.',
      'Cover initial balance, deposit, withdraw, too-much-withdraw and transfer errors, and `fetchBalance`/`synchronizeBalance`. The last two are random, so control them with `jest.spyOn(account, "fetchBalance").mockResolvedValueOnce(…)`.',
    ),
    step(
      '05-partial-mocking',
      '05: partial mocking',
      'jest.mock with requireActual.',
      "Mock only some functions of the module (so they don't call `console.log`) and keep `unmockedFunction` real. Assert which ones were called.",
      ['`jest.mock("./index", () => ({ ...jest.requireActual("./index"), mockOne: jest.fn() }))`'],
    ),
    step(
      '06-mocking-node-api',
      '06: mocking Node API & timers',
      'Fake timers, fs and path mocks.',
      'Use `jest.useFakeTimers()` with `advanceTimersByTime` to test `doStuffByTimeout`/`doStuffByInterval`. Mock `fs` and `fs/promises` to test `readFileAsynchronously` (existing and non-existing file), and assert that `path.join` was called with the right arguments.',
    ),
    step(
      '07-mocking-lib-api',
      '07: mocking library APIs',
      'axios and lodash throttle.',
      "Mock `axios.create` so it returns an object with a mocked `get`. Assert the base URL, the request path and the returned data. Mock lodash `throttle` to be an identity function so calls aren't delayed.",
    ),
    step(
      '08-snapshot-testing',
      '08: snapshot testing',
      'toStrictEqual and toMatchSnapshot.',
      'For the linked-list generator: write one test with an explicit expected structure (`toStrictEqual`) and one with `toMatchSnapshot()`. Commit the snapshot file and look at it.',
    ),
  ],
};
