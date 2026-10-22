import { nodeApi, programModule } from '../links';
import type { Week } from '../types';
import { CRUD_PROJECT } from './week-05';

export const week06: Week = {
  id: 'w06',
  number: 6,
  programWeek: 3,
  title: 'CRUD API: robustness, tests & horizontal scaling',
  short: 'Errors, tests & cluster',
  goals: [
    'Handle unknown routes and unexpected errors consistently',
    'Set up dev/prod builds',
    'Test an HTTP API without opening a real port',
    'Scale with the Cluster API behind a round-robin load balancer and keep state consistent',
  ],
  modules: [programModule('crud-api', 'Network communication: HTTP')],
  tasks: [
    {
      id: 'w06-cluster-read',
      kind: 'read',
      title: 'Cluster API and load balancing',
      summary: 'How one Node app uses all CPU cores, and how a proxy spreads requests.',
      estimateH: 1.5,
      resources: [
        { title: 'Cluster API', url: nodeApi('cluster') },
        { title: 'http.request (for proxying)', url: nodeApi('http', 'httprequesturl-options-callback') },
        { title: 'Round-robin load balancing', url: 'https://en.wikipedia.org/wiki/Round-robin_scheduling' },
        { title: 'Fastify: testing with inject()', url: 'https://fastify.dev/docs/latest/Guides/Testing/' },
      ],
      questions: [
        'Each worker is a separate process with its own memory. How can they share one "database"?',
        'How does the primary process talk to workers (`worker.send` / `process.on("message")`)?',
        'How do you proxy a request (method, headers, body stream) and its response with plain `http.request`?',
      ],
    },
    {
      id: 'w06-crud-errors',
      kind: 'code',
      title: '404 for unknown routes + 500 handler',
      summary: 'setNotFoundHandler and setErrorHandler.',
      estimateH: 1,
      projectId: CRUD_PROJECT,
      points: 20,
      description:
        'Use `app.setNotFoundHandler` for **404** `{ message: "Route GET /foo not found" }` and `app.setErrorHandler` for everything else. Validation errors map to 400. Unknown errors are logged and return **500** `{ message: "Internal server error" }` without leaking stack traces. Add a temporary route that throws, to test it.',
      run: 'curl -i localhost:4000/some-non/existing/resource',
      expected: 'HTTP/1.1 404 Not Found\n{"message":"Route GET /some-non/existing/resource not found"}',
      acceptance: ['404 and 500 bodies are human-friendly JSON', 'No stack traces in responses'],
    },
    {
      id: 'w06-crud-modes',
      kind: 'code',
      title: 'start:dev and start:prod',
      summary: 'Watch mode for development, bundled build for production.',
      estimateH: 1,
      projectId: CRUD_PROJECT,
      points: 20,
      description: `\`package.json\` scripts:
~~~json
"start:dev": "tsx watch src/server.ts",
"build": "esbuild src/server.ts --bundle --platform=node --outfile=dist/server.js",
"start:prod": "npm run build && node dist/server.js"
~~~
\`tsc\` works too. Any bundler is allowed.`,
      run: 'npm run start:prod',
      acceptance: ['Dev mode restarts on file save', 'Prod mode builds and runs the built file'],
    },
    {
      id: 'w06-crud-tests',
      kind: 'code',
      title: 'API tests: at least 3 scenarios',
      summary: 'Use fastify.inject() with node:test or Vitest.',
      estimateH: 2,
      projectId: CRUD_PROJECT,
      points: 30,
      description: `Write at least **3 scenarios** with \`app.inject()\`, so no real port is needed:
1. The happy path: empty list → create → get → update → delete → get returns 404
2. Validation: invalid uuid → 400, invalid body → 400
3. Unknown route → 404, unknown id → 404

Build a fresh \`buildApp()\` for each test so state doesn't leak between them.`,
      run: 'npm test',
      acceptance: ['≥ 3 scenarios, all green', "Tests don't depend on each other's state"],
    },
    {
      id: 'w06-crud-multi',
      kind: 'code',
      title: 'start:multi: cluster + round-robin balancer + shared state',
      summary: 'The 50-point hacker task.',
      estimateH: 4,
      projectId: CRUD_PROJECT,
      points: 50,
      description: `\`npm run start:multi\`:
- **Primary** forks \`availableParallelism() − 1\` workers. Worker *i* listens on \`PORT + i\`.
- **Load balancer** (an http server on \`PORT\`, in the primary) forwards each request to the next worker in round-robin order and streams the response back.
- **Shared state**: keep the products in the **primary**. Workers use an \`IpcProductRepository\` that sends \`{ op, payload, requestId }\` to the primary via \`process.send\` and awaits the reply. Because of the repository interface from week 5, the routes don't change.

Check consistency: POST to :4001, GET from :4002, DELETE on :4003, GET on :4001 → 404.`,
      run: 'npm run start:multi\nfor i in 1 2 3 4; do curl -s localhost:4000/api/products -o /dev/null -w "%{http_code}\\n"; done',
      acceptance: [
        'Requests rotate across workers (log the worker port)',
        'State is consistent across workers',
        'A crashed worker is re-forked (bonus)',
      ],
    },
    {
      id: 'w06-crud-readme',
      kind: 'code',
      title: 'README',
      summary: 'Install, run, endpoints, examples.',
      estimateH: 0.5,
      projectId: CRUD_PROJECT,
      points: 10,
      description:
        'Document: requirements (Node 24), `npm ci`, `.env` setup, every script, every endpoint with a curl example, and how to run the tests.',
      acceptance: ['A new person can run the project from the README alone'],
    },
    {
      id: 'w06-crud-ship',
      kind: 'code',
      title: 'Ship & self-score: CRUD API',
      summary: 'Check every line of the score sheet, open the PR.',
      estimateH: 0.5,
      projectId: CRUD_PROJECT,
      description:
        'Run every endpoint in Postman (save a collection), and run tests, `start:dev`, `start:prod` and `start:multi`. Check `package.json` has no disallowed dependencies. Open the PR with your self-score.',
      acceptance: [
        'Self-score written down (target ≥ 200/222)',
        'Postman collection exported into the repo (optional)',
      ],
    },
  ],
};
