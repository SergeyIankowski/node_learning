import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

const PROJECT = 'w16-logging';

export const week16: Week = {
  id: 'w16',
  number: 16,
  programWeek: 8,
  title: 'Logging & error handling',
  short: 'Logging & errors',
  goals: [
    'Configure leveled, structured logging in Nest',
    'Log requests and responses safely (redaction)',
    'Centralize error handling with custom error classes and a global filter',
    'Handle process-level failures with graceful shutdown, and rotate log files',
  ],
  modules: [programModule('rest/logging-error-handling', 'REST service: Logging & Error handling')],
  tasks: [
    {
      id: 'w16-logging-read',
      kind: 'read',
      title: 'Error handling and logging in Node.js',
      summary: 'Operational vs programmer errors, async errors, log levels.',
      estimateH: 2.5,
      resources: [
        { title: 'Lecture: Logging & error handling', url: 'https://youtu.be/hJ-iN2NARX8', lang: 'RU' },
        { title: 'Repository from the lecture', url: 'https://github.com/RidgeA/rss-school-20200408' },
        { title: 'javascript.info: error handling, try…catch', url: 'https://javascript.info/try-catch' },
        {
          title: 'Node.js error handling best practices (Sematext)',
          url: 'https://sematext.com/blog/node-js-error-handling/',
        },
        {
          title: 'Node.js error handling best practices (Stackify)',
          url: 'https://stackify.com/node-js-error-handling/',
        },
        { title: 'Nest: logger', url: 'https://docs.nestjs.com/techniques/logger' },
        { title: 'Nest: exception filters', url: 'https://docs.nestjs.com/exception-filters' },
        {
          title: 'Node.js process events',
          url: 'https://nodejs.org/docs/latest-v24.x/api/process.html#process-events',
        },
      ],
      questions: [
        'Operational vs programmer errors: which ones should crash the process?',
        'Why is continuing after `uncaughtException` unsafe?',
        'What should a production log line contain (timestamp, level, context, request id…)? Why JSON?',
        'Where can secrets leak into logs?',
      ],
    },
    {
      id: 'w16-process-events',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: crash on purpose',
      summary: 'See uncaughtException, unhandledRejection and shutdown in action.',
      estimateH: 0.5,
      description: `Write \`crash.mjs\`: start an http server, register \`process.on('uncaughtException')\` and \`process.on('unhandledRejection')\` handlers that log and then call \`server.close(() => process.exit(1))\`, with a 5 s forced-exit timeout (\`setTimeout(...).unref()\`).

Trigger each one with \`?crash=sync\` (\`setTimeout(() => { throw new Error() })\`) and \`?crash=promise\` (\`Promise.reject(new Error())\`). Also try \`SIGTERM\` (\`kill <pid>\`).`,
      run: 'node crash.mjs &\ncurl "localhost:3000/?crash=promise"; echo "exit: $?"',
      acceptance: [
        'Both crash kinds are logged and exit with code 1 after `close`',
        'SIGTERM shuts down cleanly with code 0',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Logging & Error handling',
      summary:
        'Leveled logger, request/response logs with redaction, custom errors, global filter, process handlers, log rotation.',
      estimateH: 1,
      ...assignment('08b-logging-errors'),
      overview: `${KH_REPO_NOTE}

Make the Knowledge Hub production-ready: observable through logs and predictable when things fail.`,
      requirements: [
        "Use Nest's logging facilities (built-in `Logger` or a custom Nest-compatible `LoggerService`)",
        'Node.js 24.x (24.10.0+)',
        '`.env.example`: `LOG_LEVEL=log`, `LOG_MAX_FILE_SIZE=1024`',
        ...PR_RULES,
      ],
      spec: `### Logger
- \`LOG_LEVEL\` (default \`log\`): \`log\`, \`debug\`, \`warn\`, \`error\`, \`verbose\`
- Development: human-readable. Production: machine-parseable (JSON)

### Request / response logging
- Request: method, URL, query, body. Response: status code, response time
- **Redaction**: \`password\` and tokens become \`"[REDACTED]"\`. They never appear in logs

### Global error handling
- Catches **all** unhandled errors, logs them with the stack at \`error\` level
- Unknown error → \`500 { statusCode: 500, error: "Internal Server Error", message: "An unexpected error occurred" }\`
- Known errors → their own status (400, 401, 403, 404…)

### Custom errors (extend \`Error\`, with a \`statusCode\` property)
\`NotFoundError\` → 404 · \`ValidationError\` → 400 · \`UnauthorizedError\` → 401 · \`ForbiddenError\` → 403. **Use them in handlers and services** instead of setting statuses by hand.

### Process level
\`uncaughtException\` and \`unhandledRejection\`: log at \`error\` level, then graceful shutdown (close the server, disconnect the DB, exit 1).

### File rotation
Write logs to a file. When it exceeds \`LOG_MAX_FILE_SIZE\` KB, rename it to \`app-2025-06-15T10-30-00.log\` and start a new \`app.log\`. Implement this yourself in the logger layer.`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** configurable `LOG_LEVEL` · **+10** request logging · **+10** response logging',
            '**+10** global exception handling · **+10** custom error classes · **+10** custom errors used in handlers',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+10** file rotation via `LOG_MAX_FILE_SIZE`',
            '**+10** redaction',
            '**+10** `uncaughtException` + graceful shutdown',
            '**+10** `unhandledRejection` + graceful shutdown',
          ],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: [
        'Logger, filter, error classes, process handlers',
        'Sample log output (dev + prod) in the PR description',
        'PR with self-score',
      ],
    },
    {
      id: 'w16-logger',
      kind: 'code',
      title: 'Custom LoggerService with LOG_LEVEL and dev/prod formats',
      summary: 'One logger for the whole app.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Implement `AppLogger implements LoggerService` (or extend `ConsoleLogger`). Map `LOG_LEVEL` to the enabled levels (`log` enables log, warn and error; `debug` adds debug; `verbose` enables everything). Output: colorized `time [Context] level message` in dev, and one JSON object per line in prod (`{ "time", "level", "context", "message", ...meta }`). Register it with `NestFactory.create(AppModule, { bufferLogs: true })` and `app.useLogger(app.get(AppLogger))`.',
      run: 'LOG_LEVEL=debug npm run start:dev\nNODE_ENV=production LOG_LEVEL=warn node dist/main.js',
      acceptance: ['Levels filter correctly', 'Prod output parses line by line with `jq`'],
    },
    {
      id: 'w16-request-logging',
      kind: 'code',
      title: 'Request/response logging with redaction',
      summary: 'Method, url, query, body, status, duration, with secrets hidden.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 30,
      description:
        'An interceptor or middleware logs the incoming request (method, url, query, **redacted** body) and, on finish, the status and `durationMs`. Write a `redact(obj)` helper that deep-clones and replaces keys matching `/password|token|secret|authorization/i` with `"[REDACTED]"`. Never log the `Authorization` header value.',
      run: 'curl -s -X POST localhost:4000/auth/login -H "content-type: application/json" -d \'{"login":"bob","password":"secret"}\' >/dev/null\ngrep -c secret logs/app.log',
      expected: '0',
      acceptance: [
        '`grep` finds no passwords or tokens in the logs',
        'Every request has a matching response log with its duration',
      ],
    },
    {
      id: 'w16-errors',
      kind: 'code',
      title: 'Custom error classes + global exception filter',
      summary: 'Throw domain errors, map them in one place.',
      estimateH: 2,
      projectId: PROJECT,
      points: 30,
      description: `~~~ts
export abstract class AppError extends Error { abstract readonly statusCode: number }
export class NotFoundError extends AppError { readonly statusCode = 404 }
// ValidationError 400, UnauthorizedError 401, ForbiddenError 403
~~~
\`@Catch()\` \`AllExceptionsFilter\`: \`AppError\` → its status. \`HttpException\` → its status and response. Anything else → 500 with the generic body, and log the stack at \`error\`. Replace \`NotFoundException\` etc. in your services with the custom errors.`,
      acceptance: [
        'Unknown errors → exactly the specified 500 body',
        'Services throw custom errors',
        'The stack is logged for 500s only',
      ],
    },
    {
      id: 'w16-process-handlers',
      kind: 'code',
      title: 'Process handlers + graceful shutdown',
      summary: 'Close HTTP, disconnect Prisma, exit 1.',
      estimateH: 1,
      projectId: PROJECT,
      points: 20,
      description:
        'In `main.ts`, after `app.listen`: `process.on("uncaughtException", (e) => shutdown(e))` and `process.on("unhandledRejection", (r) => shutdown(r))`, where `shutdown` logs at error level, `await app.close()` (which triggers `onModuleDestroy`, so Prisma disconnects), then `process.exit(1)`. Add a forced-exit timeout. Also `app.enableShutdownHooks()` for SIGTERM.',
      acceptance: [
        'A deliberate unhandled rejection is logged and the process exits 1',
        '`docker compose stop` shuts down cleanly',
      ],
    },
    {
      id: 'w16-rotation',
      kind: 'code',
      title: 'Log file rotation by size',
      summary: 'app.log → app-<timestamp>.log when it exceeds LOG_MAX_FILE_SIZE KB.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Use an append `WriteStream` to `logs/app.log`, and track `bytesWritten` plus the initial size. Before writing, if `size + line > max`: end the stream, `rename` it to `app-${new Date().toISOString().replace(/[:.]/g, "-")}.log`, and open a new one. Queue writes while rotating so no line is lost. Mount `logs/` as a volume in Compose.',
      run: 'LOG_MAX_FILE_SIZE=1 npm run start:dev\nfor i in $(seq 200); do curl -s localhost:4000/ >/dev/null; done\nls -la logs/',
      acceptance: ['Several rotated files appear', 'No lines are lost or interleaved across rotations'],
    },
    {
      id: 'w16-logging-ship',
      kind: 'code',
      title: 'Ship & self-score: Logging',
      summary: 'Sample logs in the PR, score.',
      estimateH: 0.5,
      projectId: PROJECT,
      description:
        'Make sure unit tests and integration tests still pass, because the filter changes error bodies. Put sample dev and prod log lines in the PR description, along with your self-score.',
      acceptance: ['All tests green', 'Self-score written down'],
    },
  ],
};
