import { assignment, nodeApi, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';

export const CRUD_PROJECT = 'w05-crud-api';

export const week05: Week = {
  id: 'w05',
  number: 5,
  programWeek: 3,
  title: 'Networking, HTTP & a Fastify CRUD API',
  short: 'HTTP & Fastify CRUD',
  goals: [
    'Explain IP, TCP vs UDP, URIs and the anatomy of an HTTP message',
    'Know what HTTP/2 changes compared to HTTP/1.1',
    'Set up a TypeScript + Fastify project and implement the Product CRUD endpoints with validation',
  ],
  modules: [programModule('crud-api', 'Network communication: HTTP')],
  tasks: [
    {
      id: 'w05-network-read',
      kind: 'read',
      title: 'Networking basics: IP, TCP, UDP, URI',
      summary: 'What sits under HTTP.',
      estimateH: 2,
      resources: [
        { title: 'Internet Protocol', url: 'https://en.wikipedia.org/wiki/Internet_Protocol' },
        { title: 'IPv4 vs IPv6', url: 'https://community.fs.com/blog/ipv4-vs-ipv6-whats-the-difference.html' },
        { title: 'Transmission Control Protocol', url: 'https://en.wikipedia.org/wiki/Transmission_Control_Protocol' },
        { title: 'User Datagram Protocol', url: 'https://en.wikipedia.org/wiki/User_Datagram_Protocol' },
        { title: 'Identifying resources on the Web (URI)', url: 'https://developer.mozilla.org/en-US/docs/Web/URI' },
      ],
      questions: [
        "What does TCP guarantee that UDP doesn't? Name a protocol that uses UDP and explain why.",
        'What happens during a TCP three-way handshake?',
        'Break `https://user@api.example.com:8443/v1/items?id=5#top` into scheme, authority, host, port, path, query and fragment.',
      ],
    },
    {
      id: 'w05-http-read',
      kind: 'read',
      title: "HTTP/1.1, HTTP/2 and Node's http module",
      summary: 'Messages, methods, status codes, headers, bodies.',
      estimateH: 2,
      resources: [
        { title: 'HTTP overview', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
        { title: 'HTTP messages', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Messages' },
        { title: 'HTTP status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
        {
          title: 'HTTP/1.1 vs HTTP/2',
          url: 'https://www.digitalocean.com/community/tutorials/http-1-1-vs-http-2-what-s-the-difference',
        },
        { title: 'Postman: testing APIs', url: 'https://learning.postman.com/docs/getting-started/introduction/' },
        { title: 'Node.js http module', url: nodeApi('http') },
        { title: 'Node.js http2 module', url: nodeApi('http2') },
      ],
      questions: [
        'Which methods are safe? Which are idempotent? Is PUT idempotent? Is POST?',
        'When do you return 400, 404, 422 and 500? And 201 vs 200 vs 204?',
        'What are multiplexing and header compression (HPACK) in HTTP/2?',
        'Why is `IncomingMessage` a Readable stream, and how do you read a JSON body with the raw `http` module?',
      ],
    },
    {
      id: 'w05-ts-read',
      kind: 'read',
      title: 'TypeScript for Node backends',
      summary: 'The rest of the course is TypeScript. Make sure the basics are solid.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: TypeScript basics, part 1', url: 'https://youtu.be/I_aTbZcH8Do', lang: 'RU' },
        { title: 'Lecture: TypeScript basics, part 2', url: 'https://youtu.be/CegrbRXGw20', lang: 'RU' },
        { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
        { title: 'Node.js: running TypeScript natively', url: 'https://nodejs.org/en/learn/typescript/run-natively' },
        { title: 'Lecture: testing basics', url: 'https://youtu.be/ab_QJ52Z-fs', lang: 'RU' },
      ],
      questions: [
        '`type` vs `interface`: when does the difference matter?',
        'What are discriminated unions and how do they help with request validation results?',
        'What do `strict`, `module: "NodeNext"` and `outDir` do in `tsconfig.json`?',
        'What is the difference between `tsx`/`ts-node` and `tsc` + `node dist/…`?',
      ],
    },
    {
      id: 'w05-raw-http',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: raw node:http server',
      summary: 'Route, parse a body and set headers without a framework.',
      estimateH: 1,
      description: `Write \`server.mjs\` with only \`node:http\`:
- \`GET /health\` → \`200 {"status":"ok"}\` with \`Content-Type: application/json\`
- \`POST /echo\` → read the body stream, \`JSON.parse\` it, send it back with \`201\`. Invalid JSON → \`400\`
- anything else → \`404\`

Then inspect the raw exchange with \`curl -v\` and find the request line, the status line and the headers.`,
      run: "node server.mjs &\ncurl -v localhost:3000/health\ncurl -i -X POST localhost:3000/echo -d '{\"a\":1}'\ncurl -i -X POST localhost:3000/echo -d 'oops'",
      expected: 'HTTP/1.1 200 OK\nContent-Type: application/json\n…\n{"status":"ok"}',
      acceptance: ['All three routes behave as described', 'You can name every line in the `curl -v` output'],
    },
    {
      id: CRUD_PROJECT,
      kind: 'project',
      title: 'Project: CRUD API (Product Catalog on Fastify)',
      summary: 'In-memory REST API with validation, error handling, dev/prod modes, tests and cluster load balancing.',
      estimateH: 1,
      ...assignment('03-crud-api'),
      maxScore: 222,
      overview: `A CRUD API for a **Product Catalog** built on **Fastify** with an in-memory database.

This plan splits it over **weeks 5–6**. Week 5 covers the project setup and the 5 endpoints. Week 6 covers error handling, run modes, tests and horizontal scaling.`,
      requirements: [
        'JavaScript or TypeScript (TypeScript gives **+30**, so use it)',
        'Allowed deps only: `fastify`, `@fastify/*`, `nodemon`, `dotenv`, `cross-env`, `typescript`, `ts-node`, `ts-node-dev`, `tsx`, `zod` (+ linter plugins), bundler + plugins, formatter, `uuid`, `@types/*`, testing libraries',
        'Node.js 24.x (24.10.0+); prefer async APIs',
        '`PORT` in `.env` (not committed!). Commit `.env.example` with `PORT=4000`',
        ...PR_RULES,
      ],
      spec: `### Product
~~~ts
interface Product {
  id: string;          // uuid, generated on the server
  name: string;        // required
  description: string; // required
  price: number;       // required, > 0
  category: string;    // required, e.g. "electronics"
  inStock: boolean;    // required
}
~~~

### Endpoints
| Method & path | Success | Errors |
|---|---|---|
| \`GET /api/products\` | 200 + all products | — |
| \`GET /api/products/:productId\` | 200 + product | 400 invalid uuid · 404 not found |
| \`POST /api/products\` | 201 + created | 400 missing fields / price ≤ 0 |
| \`PUT /api/products/:productId\` | 200 + updated | 400 invalid uuid · 404 not found |
| \`DELETE /api/products/:productId\` | 204 | 400 invalid uuid · 404 not found |

- Unknown routes → **404** with a human-friendly message
- Unhandled server errors → **500** with a human-friendly message

### Run modes
- \`npm run start:dev\` — nodemon / ts-node-dev / tsx watch
- \`npm run start:prod\` — build, then run the bundled file
- \`npm run start:multi\` — Cluster: \`availableParallelism() − 1\` workers on \`PORT+1…PORT+n\`, plus a **round-robin load balancer** on \`PORT\`. The DB state must be **consistent** across workers

### Tests
At least 3 scenarios, for example: get all (empty) → create → get by id → update → delete → get deleted (404).`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** README with install/run/use instructions',
            '**+10** each: GET all · GET by id · POST · PUT · DELETE',
            '**+6** product shape as specified · **+6** port from `.env`',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+30** TypeScript',
            '**+10** non-existing endpoints handled',
            '**+10** server errors handled (500)',
            '**+10** `start:dev` · **+10** `start:prod`',
          ],
        },
        {
          scope: 'Hacker',
          items: ['**+30** API tests (≥ 3 scenarios)', '**+50** horizontal scaling with load balancer'],
        },
        { scope: 'Forfeits', items: ['**−95%** disallowed dependencies', ...PR_FORFEITS, '**−5** `.env` committed'] },
      ],
      deliverables: ['Repository `crud-api` with README', 'PR with self-score'],
    },
    {
      id: 'w05-crud-setup',
      kind: 'code',
      title: 'Project setup: TypeScript + Fastify + .env',
      summary: 'Skeleton with a layered structure ready for the endpoints.',
      estimateH: 1.5,
      projectId: CRUD_PROJECT,
      points: 6,
      description: `\`npm i fastify dotenv\` and \`npm i -D typescript tsx @types/node\`. Create a \`tsconfig.json\` with strict mode and \`.env\`/\`.env.example\`. Add \`.env\` to \`.gitignore\`.

Suggested layout. Keep storage behind an interface, because week 6 needs a shared store for cluster mode:
~~~
src/
  app.ts            // buildApp(): FastifyInstance (no listen → testable)
  server.ts         // reads PORT, listens
  products/
    product.types.ts
    product.repository.ts   // interface ProductRepository + InMemoryProductRepository
    product.routes.ts
    product.schemas.ts      // JSON Schema or zod
~~~`,
      run: 'npm run start:dev\ncurl -i localhost:4000/api/products',
      expected: 'HTTP/1.1 200 OK\n…\n[]',
      acceptance: [
        'The server starts on `PORT` from `.env`',
        '`buildApp()` is separate from `listen()`',
        '`.env` is git-ignored and `.env.example` is committed',
      ],
    },
    {
      id: 'w05-crud-get',
      kind: 'code',
      title: 'GET /api/products and /api/products/:id',
      summary: 'List and fetch with uuid validation (400) and 404.',
      estimateH: 1,
      projectId: CRUD_PROJECT,
      points: 20,
      description:
        'Implement both GET routes. Validate `productId` as a uuid with `crypto.randomUUID`-compatible regex, a JSON-schema `format: uuid` or `z.uuid()`. Invalid → **400** `{ message }`. Not found → **404** `{ message }`.',
      run: 'curl -i localhost:4000/api/products/not-a-uuid\ncurl -i localhost:4000/api/products/3f1c3e64-5f9b-4a8f-9a8d-2b1f0d7d1e11',
      expected: 'HTTP/1.1 400 Bad Request …\nHTTP/1.1 404 Not Found …',
      acceptance: ['Correct status codes and human-readable messages', 'The response is JSON in all cases'],
    },
    {
      id: 'w05-crud-post',
      kind: 'code',
      title: 'POST /api/products with validation',
      summary: 'Body validation: required fields, types, price > 0.',
      estimateH: 1.5,
      projectId: CRUD_PROJECT,
      points: 10,
      description:
        'Validate the body with a Fastify JSON schema (`required`, `exclusiveMinimum: 0` for price, `additionalProperties: false`) or zod. Generate `id` with `crypto.randomUUID()`. Return **201** with the created record.',
      run: 'curl -i -X POST localhost:4000/api/products -H "content-type: application/json" \\\n  -d \'{"name":"Book","description":"Nice","price":12.5,"category":"books","inStock":true}\'\ncurl -i -X POST localhost:4000/api/products -H "content-type: application/json" -d \'{"name":"x","price":-1}\'',
      acceptance: [
        '201 + record with `id`',
        'Missing field / wrong type / price ≤ 0 → 400 with a message',
        'Clients cannot set `id`',
      ],
    },
    {
      id: 'w05-crud-put',
      kind: 'code',
      title: 'PUT /api/products/:id',
      summary: 'Update an existing record, keep its id.',
      estimateH: 0.5,
      projectId: CRUD_PROJECT,
      points: 10,
      description:
        'Update the product and return **200** with the updated record. Same 400 and 404 rules as GET. Validate the body with the same schema as POST. Decide (and document) whether PUT requires all fields; the spirit of PUT is a full replacement.',
      acceptance: ['The id never changes', 'Invalid body → 400', 'Unknown id → 404'],
    },
    {
      id: 'w05-crud-delete',
      kind: 'code',
      title: 'DELETE /api/products/:id',
      summary: '204 with an empty body.',
      estimateH: 0.5,
      projectId: CRUD_PROJECT,
      points: 10,
      description: 'Delete the product and reply **204** with no body. Same 400 and 404 rules as GET.',
      run: 'curl -i -X DELETE localhost:4000/api/products/<id>',
      expected: 'HTTP/1.1 204 No Content',
      acceptance: ['204 with an empty body', 'A second delete of the same id → 404'],
    },
  ],
};
