# Node.js study plan (RS School program, 20 weeks)

> Generated from `src/data` by `npm run plan:md`. Do not edit by hand.

Source program: https://github.com/rolling-scopes-school/tasks/blob/master/node/README.md

Each program week is split into two study weeks. Task kinds: **Read** (theory, each with a multi-level test), **Code** (exercise or assignment step), **Project** (full app specification).

## Overview

| Week | Program week | Topic | Read | Code | Project | Hours |
|---|---|---|---|---|---|---|
| 1 | 1 | Setup, event loop, modules, file system & CLI | 3 | 9 | 1 | ~20 |
| 2 | 1 | Streams, crypto, zlib, worker threads & child processes | 3 | 11 | 0 | ~21 |
| 3 | 2 | Data Processing CLI: REPL, navigation & converters | 1 | 7 | 1 | ~12 |
| 4 | 2 | Data Processing CLI: hashing, AES-GCM & parallel log stats | 1 | 8 | 0 | ~12 |
| 5 | 3 | Networking, HTTP & a Fastify CRUD API | 3 | 6 | 1 | ~14 |
| 6 | 3 | CRUD API: robustness, tests & horizontal scaling | 1 | 6 | 0 | ~11 |
| 7 | 4 | WebSocket: protocol basics & quiz game lobby | 1 | 5 | 1 | ~9 |
| 8 | 4 | WebSocket: game loop, timers & disconnects | 1 | 7 | 0 | ~8 |
| 9 | 5 | Nest.js fundamentals & Knowledge Hub API (users, categories) | 2 | 5 | 1 | ~13 |
| 10 | 5 | Knowledge Hub API: articles, comments, cascades & Swagger | 1 | 8 | 0 | ~10 |
| 11 | 6 | Containerization with Docker & Compose | 1 | 9 | 1 | ~12 |
| 12 | 6 | PostgreSQL, SQL basics & Prisma ORM | 2 | 8 | 1 | ~16 |
| 13 | 7 | Authentication, JWT, RBAC & web security | 1 | 8 | 1 | ~14 |
| 14 | 7 | Testing basics with Jest | 2 | 8 | 1 | ~12 |
| 15 | 8 | Unit testing a Nest.js API with Vitest | 1 | 10 | 1 | ~16 |
| 16 | 8 | Logging & error handling | 1 | 7 | 1 | ~12 |
| 17 | 9 | LLM integration: Gemini API in a Nest service | 1 | 7 | 1 | ~12 |
| 18 | 9 | AI hardening: rate limits, caching, usage & resilience | 1 | 7 | 0 | ~10 |
| 19 | 10 | RAG foundations: embeddings, chunking & a vector DB | 1 | 6 | 1 | ~12 |
| 20 | 10 | RAG chat, consistency & the finish line | 2 | 6 | 0 | ~15 |

## Week 1: Setup, event loop, modules, file system & CLI

Program week 1 · [Node.js installation and configuration](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/nodejs-installation/README.md) · [Node.js basics](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/nodejs-basics/README.md)

**Goals**

- Install Node.js 24 with nvm and know what LTS means
- Explain the event loop phases, microtasks and why I/O is non-blocking
- Use ES modules, dynamic import, the fs/promises API and process.argv
- Solve the fs, cli and modules parts of the "Node.js Fundamentals" assignment

**Tasks**

- [ ] **Read**: Installing Node.js, nvm and npm (~1h): How Node is installed and versioned, and why you should use a version manager. Ends with a 11-question test.
- [ ] **Code**: Warm-up: install Node 24 with nvm _(warm-up)_ (~0.5h): Get the exact Node version every assignment requires (24.10+).
- [ ] **Read**: Event loop and non-blocking I/O (~3h): The single most important concept in Node.js. Ends with a 12-question test.
- [ ] **Code**: Warm-up: predict the event loop order _(warm-up)_ (~1h): Write down the output on paper first, then run it.
- [ ] **Read**: Modules, file system and CLI APIs (~3h): CommonJS vs ESM, fs/promises, process.argv and the CLI. Ends with a 11-question test.
- [ ] **Project**: Project: Node.js Fundamentals (~1h): Standalone exercises on core APIs: fs, CLI, modules, hash, streams, zlib, worker threads, child processes.
- [ ] **Code**: fs: snapshot.js (~2h): Recursively serialize a directory tree into JSON with base64 file contents.
- [ ] **Code**: fs: restore.js (~1.5h): Recreate a directory tree from snapshot.json.
- [ ] **Code**: fs: findByExt.js (~1h): Recursive search by extension, read from a CLI argument.
- [ ] **Code**: fs: merge.js (~1h): Concatenate text parts in a given or alphabetical order.
- [ ] **Code**: cli: interactive.js (~1.5h): A tiny REPL built with readline.
- [ ] **Code**: cli: progress.js (+ color) (~2h): In-place terminal progress bar with options and ANSI color.
- [ ] **Code**: modules: dynamic.js (~1h): Load a plugin by name with dynamic import().

## Week 2: Streams, crypto, zlib, worker threads & child processes

Program week 1 · [Node.js basics](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/nodejs-basics/README.md)

**Goals**

- Build Readable → Transform → Writable pipelines and understand backpressure
- Hash and compress data with streams
- Parallelize CPU work with worker_threads and run external commands with child_process
- Finish and self-score the "Node.js Fundamentals" assignment

**Tasks**

- [ ] **Read**: Streams and backpressure (~3h): Streams are everywhere in Node: files, HTTP, sockets, process.stdin. Ends with a 12-question test.
- [ ] **Read**: crypto, zlib, os (~1.5h): Hashing, compression and system info APIs. Ends with a 11-question test.
- [ ] **Read**: Worker threads and child processes (~1.5h): Two ways to escape the single JS thread. Ends with a 11-question test.
- [ ] **Code**: Warm-up: uppercase Transform stream _(warm-up)_ (~0.5h): Your first custom Transform with pipeline().
- [ ] **Code**: Warm-up: see backpressure with your own eyes _(warm-up)_ (~1h): Write 5M lines with and without honoring write() === false.
- [ ] **Code**: hash: verify.js (~1h): Verify SHA256 checksums with streams.
- [ ] **Code**: streams: lineNumberer.js (~1h): Prefix each line from stdin with its number.
- [ ] **Code**: streams: filter.js (~0.5h): grep-like Transform using --pattern.
- [ ] **Code**: streams: split.js (~1.5h): Split a file into chunk_N.txt files of at most N lines.
- [ ] **Code**: zip: compressDir.js (~2h): Pack a directory tree into a single brotli archive.
- [ ] **Code**: zip: decompressDir.js (~2h): Unpack your archive format back into the original tree.
- [ ] **Code**: wt: parallel sort with k-way merge (~3h): Sort chunks in N workers, merge them in the main thread.
- [ ] **Code**: cp: execCommand.js (~1h): Spawn a command, pipe its output, forward its exit code.
- [ ] **Code**: Ship & self-score: Node.js Fundamentals (~1h): Run every script, check against the score sheet.

## Week 3: Data Processing CLI: REPL, navigation & converters

Program week 2 · [Data Processing CLI](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/data-processing-cli/README.md)

**Goals**

- Build a persistent REPL with readline that keeps its own working directory
- Parse command arguments and resolve paths relative to app state
- Convert CSV ⇄ JSON and count words with stream pipelines

**Tasks**

- [ ] **Read**: readline, process and path (~2h): Everything you need for an interactive CLI. Ends with a 11-question test.
- [ ] **Code**: Warm-up: mini REPL with async commands _(warm-up)_ (~0.5h): Two commands, one async, prompt re-shown after each.
- [ ] **Project**: Project: Data Processing CLI (~1h): An interactive toolkit: navigation, CSV/JSON, count, hash, AES-GCM encryption and log stats with workers.
- [ ] **Code**: REPL shell: welcome, prompt, exit, errors (~2h): main.js + repl.js: the skeleton every command plugs into.
- [ ] **Code**: utils: argParser + pathResolver (~1h): Parse --flags and resolve paths against the app's cwd.
- [ ] **Code**: navigation: up, cd, ls (~1.5h): Move around the filesystem from inside the app.
- [ ] **Code**: csv-to-json (~2h): Readable → line-splitting Transform → JSON array writer.
- [ ] **Code**: json-to-csv (~1h): Buffer and parse JSON, stream CSV out.
- [ ] **Code**: count (~1h): wc -lwc implemented as a stream consumer.

## Week 4: Data Processing CLI: hashing, AES-GCM & parallel log stats

Program week 2 · [Data Processing CLI](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/data-processing-cli/README.md)

**Goals**

- Hash and compare files with createHash in a stream pipeline
- Encrypt and decrypt files with AES-256-GCM end-to-end with streams
- Process a large log file in parallel with worker threads and merge partial results
- Ship the project with a proper PR

**Tasks**

- [ ] **Read**: Hashes, key derivation and authenticated encryption (~2h): createHash, scrypt, createCipheriv with AES-256-GCM, auth tags. Ends with a 11-question test.
- [ ] **Code**: Warm-up: AES-256-GCM round trip in memory _(warm-up)_ (~0.5h): Encrypt a string, decrypt it, then tamper with one byte.
- [ ] **Code**: hash (+ --algorithm, --save) (~1h): Stream a file through createHash.
- [ ] **Code**: hash-compare (~0.5h): Compare a file's hash with a stored value.
- [ ] **Code**: encrypt (AES-256-GCM, streaming) (~1.5h): salt + iv header, streamed ciphertext, auth tag trailer.
- [ ] **Code**: decrypt (verify the auth tag) (~1.5h): Read the header and tag, stream the middle through the decipher.
- [ ] **Code**: log-stats with worker threads (~3h): Split a 500k-line log by CPU count on line boundaries, aggregate in parallel.
- [ ] **Code**: Project structure, README and PR (~1h): Match the required file layout and git workflow.
- [ ] **Code**: Ship & self-score: Data Processing CLI (~1h): Full manual test session against the score sheet.

## Week 5: Networking, HTTP & a Fastify CRUD API

Program week 3 · [Network communication: HTTP](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/crud-api/README.md)

**Goals**

- Explain IP, TCP vs UDP, URIs and the anatomy of an HTTP message
- Know what HTTP/2 changes compared to HTTP/1.1
- Set up a TypeScript + Fastify project and implement the Product CRUD endpoints with validation

**Tasks**

- [ ] **Read**: Networking basics: IP, TCP, UDP, URI (~2h): What sits under HTTP. Ends with a 11-question test.
- [ ] **Read**: HTTP/1.1, HTTP/2 and Node's http module (~2h): Messages, methods, status codes, headers, bodies. Ends with a 11-question test.
- [ ] **Read**: TypeScript for Node backends (~3h): The rest of the course is TypeScript. Make sure the basics are solid. Ends with a 11-question test.
- [ ] **Code**: Warm-up: raw node:http server _(warm-up)_ (~1h): Route, parse a body and set headers without a framework.
- [ ] **Project**: Project: CRUD API (Product Catalog on Fastify) (~1h): In-memory REST API with validation, error handling, dev/prod modes, tests and cluster load balancing.
- [ ] **Code**: Project setup: TypeScript + Fastify + .env (~1.5h): Skeleton with a layered structure ready for the endpoints.
- [ ] **Code**: GET /api/products and /api/products/:id (~1h): List and fetch with uuid validation (400) and 404.
- [ ] **Code**: POST /api/products with validation (~1.5h): Body validation: required fields, types, price > 0.
- [ ] **Code**: PUT /api/products/:id (~0.5h): Update an existing record, keep its id.
- [ ] **Code**: DELETE /api/products/:id (~0.5h): 204 with an empty body.

## Week 6: CRUD API: robustness, tests & horizontal scaling

Program week 3 · [Network communication: HTTP](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/crud-api/README.md)

**Goals**

- Handle unknown routes and unexpected errors consistently
- Set up dev/prod builds
- Test an HTTP API without opening a real port
- Scale with the Cluster API behind a round-robin load balancer and keep state consistent

**Tasks**

- [ ] **Read**: Cluster API and load balancing (~1.5h): How one Node app uses all CPU cores, and how a proxy spreads requests. Ends with a 11-question test.
- [ ] **Code**: 404 for unknown routes + 500 handler (~1h): setNotFoundHandler and setErrorHandler.
- [ ] **Code**: start:dev and start:prod (~1h): Watch mode for development, bundled build for production.
- [ ] **Code**: API tests: at least 3 scenarios (~2h): Use fastify.inject() with node:test or Vitest.
- [ ] **Code**: start:multi: cluster + round-robin balancer + shared state (~4h): The 50-point hacker task.
- [ ] **Code**: README (~0.5h): Install, run, endpoints, examples.
- [ ] **Code**: Ship & self-score: CRUD API (~0.5h): Check every line of the score sheet, open the PR.

## Week 7: WebSocket: protocol basics & quiz game lobby

Program week 4 · [Network communication: WebSocket](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/websocket/README.md)

**Goals**

- Understand how WebSocket upgrades from HTTP and frames messages
- Build a typed message router on top of the `ws` library
- Implement registration, game creation and joining with broadcasts

**Tasks**

- [ ] **Read**: Communication protocols and WebSocket (~2h): Full-duplex communication over one TCP connection. Ends with a 11-question test.
- [ ] **Code**: Warm-up: broadcast chat with ws _(warm-up)_ (~1h): 30 lines: connect, name yourself, broadcast.
- [ ] **Project**: Project: WebSocket Live Quiz Game (~1h): Backend for a Kahoot-style game: rooms, timed questions, speed-based scoring.
- [ ] **Code**: Server skeleton: message router & send helpers (~1.5h): Parse the double-encoded JSON once and dispatch by type.
- [ ] **Code**: reg: register / login (~1h): Unknown name → register; known name → check password.
- [ ] **Code**: create_game: validate questions, generate code (~1h): Unique 6-character alphanumeric room codes.
- [ ] **Code**: join_game + player_joined + update_players (~1.5h): Room membership and broadcasts.

## Week 8: WebSocket: game loop, timers & disconnects

Program week 4 · [Network communication: WebSocket](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/websocket/README.md)

**Goals**

- Drive a state machine with server-side timers
- Compute speed-based scores and ranked scoreboards
- Handle disconnects without breaking the game

**Tasks**

- [ ] **Read**: Timers and state machines for real-time servers (~1h): Model the game as explicit states and transitions before you code it. Ends with a 11-question test.
- [ ] **Code**: start_game (host only) → first question (~1h): Authorization check and the first broadcast.
- [ ] **Code**: answer → answer_accepted (~1h): Validate and store exactly one answer per player per question.
- [ ] **Code**: Server timer + question_result (~1.5h): Close each question after timeLimitSec even if players are silent.
- [ ] **Code**: Speed-based scoring (~0.5h): basePoints × timeRemaining / timeLimit.
- [ ] **Code**: Full flow → game_finished with ranks (~1h): End-to-end game with a ranked scoreboard.
- [ ] **Code**: Disconnect handling (~1h): A player leaving mid-game must not freeze it.
- [ ] **Code**: Ship & self-score: Live Quiz Game (~0.5h): Play-test, check the score sheet, open the PR.

## Week 9: Nest.js fundamentals & Knowledge Hub API (users, categories)

Program week 5 · [REST service](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/rest/README.md)

**Goals**

- Understand Nest building blocks: modules, controllers, providers, DI, pipes, guards, interceptors
- Design a storage layer you can swap for a database later
- Implement the User and Category resources with DTO validation

**Tasks**

- [ ] **Read**: Nest.js core concepts (~4h): Read the "Overview" section of the docs end to end. Ends with a 12-question test.
- [ ] **Read**: REST and layered architecture (~1h): Resources, verbs, status codes, and why controllers should stay thin. Ends with a 11-question test.
- [ ] **Code**: Warm-up: Notes module with DTO validation _(warm-up)_ (~1.5h): Generate a Nest app, add one resource end to end.
- [ ] **Project**: Project: Nest.js Knowledge Hub API (~1h): Users, articles, categories and comments with in-memory storage, validation, Swagger and cascades.
- [ ] **Code**: Repo from template, config, global validation (~1h): Run the provided tests first, so you know your baseline.
- [ ] **Code**: Storage layer you can swap later (~1.5h): Repository interfaces + in-memory implementations behind DI tokens.
- [ ] **Code**: UserModule (~2h): CRUD, password never returned, 403 on a wrong old password.
- [ ] **Code**: CategoryModule (~1h): The simplest resource: practise the pattern.

## Week 10: Knowledge Hub API: articles, comments, cascades & Swagger

Program week 5 · [REST service](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/rest/README.md)

**Goals**

- Implement filtering, relations between resources and cascades in the service layer
- Add cross-cutting concerns with middleware and interceptors
- Document the API with OpenAPI at /doc
- Pass all provided tests with zero lint errors

**Tasks**

- [ ] **Read**: OpenAPI with @nestjs/swagger, serialization (~1h): Generate docs from your DTOs. Ends with a 11-question test.
- [ ] **Code**: ArticleModule + filtering (~2h): GET /article?status=&categoryId=&tag=
- [ ] **Code**: CommentModule (~1h): Required articleId query, 422 for a missing article.
- [ ] **Code**: Cascading deletes (~1h): Nullify or remove dependent records.
- [ ] **Code**: Logging middleware & response interceptor (~1h): Cross-cutting concerns outside the controllers.
- [ ] **Code**: Swagger at /doc (~1h): Documented DTOs, params and responses.
- [ ] **Code**: Hacker scope: pagination & sorting (~1.5h): ?page&limit → { total, page, limit, data }, ?sortBy&order.
- [ ] **Code**: All provided tests green, zero lint errors (~1h): Each passing test is +10. Each lint error is −10.
- [ ] **Code**: Ship & self-score: Knowledge Hub API (~0.5h): README, PR, score.

## Week 11: Containerization with Docker & Compose

Program week 6 · [REST service: Containerization](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/containerization/README.md)

**Goals**

- Understand images, containers, layers, volumes and networks
- Write a small, secure, multi-stage Dockerfile for a Nest app
- Run app + PostgreSQL (+ adminer) with Docker Compose, health checks and restart policies

**Tasks**

- [ ] **Read**: Docker basics and Dockerfile best practices (~3h): Images vs containers, layers and caching, multi-stage builds, Compose. Ends with a 11-question test.
- [ ] **Code**: Warm-up: Docker CLI drills _(warm-up)_ (~1h): run, ps, logs, exec, volumes, networks.
- [ ] **Project**: Project: Containerization & Docker (foundation) (~1h): Dockerize the Knowledge Hub API and run it with PostgreSQL in Compose.
- [ ] **Code**: .dockerignore (~0.25h): Keep the build context small and secrets out.
- [ ] **Code**: Multi-stage Dockerfile (alpine, non-root) (~2h): Build stage + slim runtime stage.
- [ ] **Code**: docker-compose: app + db, network, volume (~2h): The whole stack with one command.
- [ ] **Code**: Health checks & restart policies (~1h): depends_on: condition: service_healthy.
- [ ] **Code**: Database env variables (~0.25h): .env / .env.example with POSTGRES_* values.
- [ ] **Code**: adminer in a debug profile (~0.25h): A DB UI only when you ask for it.
- [ ] **Code**: Security scan + push to Docker Hub (~1h): docker scout / trivy, then docker push.
- [ ] **Code**: Ship & self-score: Docker (~0.5h): Fresh clone → docker compose up → works.

## Week 12: PostgreSQL, SQL basics & Prisma ORM

Program week 6 · [REST service: Database & ORM](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/database-orm/README.md)

**Goals**

- Write basic SQL: DDL, joins, aggregation, indexes
- Model relations in Prisma: one-to-many, many-to-many and referential actions
- Replace in-memory storage with Prisma, using migrations, seed and transactions

**Tasks**

- [ ] **Read**: Databases, SQL and PostgreSQL (~3h): Enough SQL to understand what your ORM generates. Ends with a 11-question test.
- [ ] **Read**: Prisma ORM (and how TypeORM compares) (~2h): Schema, client, migrations, relations. Ends with a 11-question test.
- [ ] **Code**: Warm-up: raw SQL in psql _(warm-up)_ (~1h): Five queries against your Compose database.
- [ ] **Project**: Project: Database & Prisma ORM (~1h): Move the Knowledge Hub from in-memory storage to PostgreSQL via Prisma.
- [ ] **Code**: Schema: models, enums, relations (~2h): Translate the domain into schema.prisma.
- [ ] **Code**: Migrations (~0.5h): Generate, apply and commit SQL migrations.
- [ ] **Code**: Seed script (~1h): Realistic data to develop against.
- [ ] **Code**: Prisma repositories replace the in-memory ones (~3h): Same interfaces, new implementation. Services don't change.
- [ ] **Code**: Cascades via onDelete + transactions (~1h): Let the database enforce the rules.
- [ ] **Code**: Hacker scope: indexes, pooling, no N+1 (~1h): Make the DB layer production-friendly.
- [ ] **Code**: Ship & self-score: Prisma (~0.5h): Fresh clone → compose up → migrated, seeded, tests green.

## Week 13: Authentication, JWT, RBAC & web security

Program week 7 · [REST service: Authentication & Authorization](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/authentication-jwt/README.md)

**Goals**

- Explain authentication vs authorization, and the trade-offs of tokens vs sessions
- Hash passwords with bcrypt and issue access + refresh JWTs
- Protect routes with a global guard and role-based access control
- Know the OWASP Top 10 and CORS basics

**Tasks**

- [ ] **Read**: Auth, JWT, OWASP Top 10, CORS (~3h): Theory for this week's project. Ends with a 12-question test.
- [ ] **Code**: Warm-up: sign and verify an HS256 JWT by hand _(warm-up)_ (~1h): No library: just base64url and HMAC.
- [ ] **Project**: Project: Authentication & Authorization (~1h): Signup/login/refresh with bcrypt and JWT, a global auth guard, RBAC, rate limiting, logout.
- [ ] **Code**: Signup with bcrypt (~1h): Hash on create and on password change, never store plain text.
- [ ] **Code**: Login: access + refresh tokens (~1h): @nestjs/jwt with separate secrets and TTLs.
- [ ] **Code**: Global JWT guard + @Public() (~1.5h): Everything protected by default.
- [ ] **Code**: Refresh endpoint (~1h): Verify the refresh token, issue a new pair.
- [ ] **Code**: RBAC: RolesGuard + ownership checks (~2h): viewer = read-only, editor = own content, admin = everything.
- [ ] **Code**: Hacker scope: rate limiting + logout (~1.5h): @nestjs/throttler on auth routes, refresh token invalidation.
- [ ] **Code**: Ship & self-score: Auth (~0.5h): Postman flow: signup → login → call → refresh → logout.

## Week 14: Testing basics with Jest

Program week 7 · [Testing basics](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/testing/README.md)

**Goals**

- Know the testing pyramid and the FIRST principles
- Use matchers, table tests, async tests and error assertions
- Mock modules and Node APIs, use fake timers, and partially mock modules

**Tasks**

- [ ] **Read**: Why and what to test (~1h): Testing pyramid, FIRST, unit vs integration vs e2e. Ends with a 10-question test.
- [ ] **Read**: Jest API (~2h): Matchers, mocks, async code, table tests. Ends with a 11-question test.
- [ ] **Project**: Project: Basic testing (Jest) (~0.5h): Write unit tests for 8 prepared modules, from simple asserts to mocking libraries.
- [ ] **Code**: 01: simple tests (~1h): expect + matchers for a calculator.
- [ ] **Code**: 02: table tests (~1h): The same cases via test.each.
- [ ] **Code**: 03: errors and async (~1h): resolves, rejects, toThrow, custom errors.
- [ ] **Code**: 04: testing a class (~1h): BankAccount: state, errors, mocked randomness.
- [ ] **Code**: 05: partial mocking (~1h): jest.mock with requireActual.
- [ ] **Code**: 06: mocking Node API & timers (~1h): Fake timers, fs and path mocks.
- [ ] **Code**: 07: mocking library APIs (~1h): axios and lodash throttle.
- [ ] **Code**: 08: snapshot testing (~1h): toStrictEqual and toMatchSnapshot.

## Week 15: Unit testing a Nest.js API with Vitest

Program week 8 · [REST service: Testing](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/testing/README.md)

**Goals**

- Test Nest providers in isolation with @nestjs/testing
- Mock the data layer and external dependencies with vi.fn / vi.mock / vi.spyOn
- Test guards, pipes, interceptors, filters and DTOs
- Reach 90% lines / 85% branches coverage with enforced thresholds

**Tasks**

- [ ] **Read**: Unit testing strategy & test doubles (~2h): Nest testing utilities, Vitest, mocks vs stubs vs fakes. Ends with a 10-question test.
- [ ] **Code**: Warm-up: first Nest service test in Vitest _(warm-up)_ (~1h): Get decorators and DI working under Vitest.
- [ ] **Project**: Project: REST service testing (Vitest) (~1h): Unit tests for services, guards, pipes, interceptors, filters and DTOs with coverage thresholds.
- [ ] **Code**: Vitest config, scripts and thresholds (~1h): test, test:unit, test:coverage with enforced thresholds.
- [ ] **Code**: User service tests (~1.5h): Hashing, roles, not found, duplicates.
- [ ] **Code**: Article service tests (~2h): Status transitions, tags, filtering.
- [ ] **Code**: Auth service tests (~1.5h): Tokens, refresh rotation, RBAC helper.
- [ ] **Code**: Guard tests: JwtAuthGuard & RolesGuard (~1.5h): Build an ExecutionContext by hand.
- [ ] **Code**: Pipe and DTO validation tests (~1h): class-validator directly, no HTTP.
- [ ] **Code**: Interceptor & filter tests (~1h): Password stripping and error shape.
- [ ] **Code**: Reach the coverage thresholds (~2h): ≥ 90% lines, ≥ 85% branches, all edge cases covered.
- [ ] **Code**: Ship & self-score: Testing (~0.5h): Coverage summary in the PR.

## Week 16: Logging & error handling

Program week 8 · [REST service: Logging & Error handling](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/rest/logging-error-handling/README.md)

**Goals**

- Configure leveled, structured logging in Nest
- Log requests and responses safely (redaction)
- Centralize error handling with custom error classes and a global filter
- Handle process-level failures with graceful shutdown, and rotate log files

**Tasks**

- [ ] **Read**: Error handling and logging in Node.js (~2.5h): Operational vs programmer errors, async errors, log levels. Ends with a 11-question test.
- [ ] **Code**: Warm-up: crash on purpose _(warm-up)_ (~0.5h): See uncaughtException, unhandledRejection and shutdown in action.
- [ ] **Project**: Project: Logging & Error handling (~1h): Leveled logger, request/response logs with redaction, custom errors, global filter, process handlers, log rotation.
- [ ] **Code**: Custom LoggerService with LOG_LEVEL and dev/prod formats (~1.5h): One logger for the whole app.
- [ ] **Code**: Request/response logging with redaction (~1.5h): Method, url, query, body, status, duration, with secrets hidden.
- [ ] **Code**: Custom error classes + global exception filter (~2h): Throw domain errors, map them in one place.
- [ ] **Code**: Process handlers + graceful shutdown (~1h): Close HTTP, disconnect Prisma, exit 1.
- [ ] **Code**: Log file rotation by size (~1.5h): app.log → app-<timestamp>.log when it exceeds LOG_MAX_FILE_SIZE KB.
- [ ] **Code**: Ship & self-score: Logging (~0.5h): Sample logs in the PR, score.

## Week 17: LLM integration: Gemini API in a Nest service

Program week 9 · [Knowledge Hub.AI: LLM Integration](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/ai-llm-integration/README.md)

**Goals**

- Call an LLM over HTTP and understand requests, responses, tokens and quotas
- Keep prompts in templates and get structured JSON output
- Expose summarize, translate and analyze endpoints over real article data

**Tasks**

- [ ] **Read**: Gemini API, prompt design, Nest HTTP (~3h): Everything needed to call an LLM from a backend. Ends with a 10-question test.
- [ ] **Code**: Warm-up: raw fetch to Gemini _(warm-up)_ (~0.5h): One script, no SDK, so you see the raw HTTP contract.
- [ ] **Project**: Project: Knowledge Hub AI (LLM integration) (~1h): Summarize, translate and analyze articles with Gemini, with rate limiting, caching, usage tracking and resilient errors.
- [ ] **Code**: AiModule + GeminiService (~2h): A single integration point with config, timeout and typed results.
- [ ] **Code**: Prompt templates module (~1h): Versioned, testable prompt builders.
- [ ] **Code**: POST /ai/articles/:id/summarize (~1h): Summary with length presets.
- [ ] **Code**: POST /ai/articles/:id/translate (~1h): Translation + detected source language.
- [ ] **Code**: POST /ai/articles/:id/analyze (structured) (~1.5h): analysis + suggestions[] + severity enum via a JSON schema.
- [ ] **Code**: Validation for all AI routes (~0.5h): DTOs + ParseUUIDPipe, correct 400/404.

## Week 18: AI hardening: rate limits, caching, usage & resilience

Program week 9 · [Knowledge Hub.AI: LLM Integration](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/ai-llm-integration/README.md)

**Goals**

- Protect a paid or quota-limited upstream with rate limiting and caching
- Retry with exponential backoff and map upstream failures to the right HTTP statuses
- Track usage and basic AI observability

**Tasks**

- [ ] **Read**: Retries, backoff, rate limiting, caching (~1.5h): Patterns for calling unreliable third-party APIs. Ends with a 10-question test.
- [ ] **Code**: Rate limiting for /ai/* (429 + Retry-After) (~1h): AI_RATE_LIMIT_RPM requests per minute.
- [ ] **Code**: Response cache for summarize/translate (~1h): Deterministic key + TTL.
- [ ] **Code**: Usage tracking endpoint (~1h): GET /ai/usage: totals, by endpoint, tokens.
- [ ] **Code**: Error mapping + exponential backoff (~1.5h): timeout → 503, auth → 500, upstream 429 → retry.
- [ ] **Code**: POST /ai/generate + conversation context (~1.5h): Optional generic endpoint with session memory (hacker scope).
- [ ] **Code**: Hacker scope: AI observability (~1h): Latency, cache hit ratio, diagnostics.
- [ ] **Code**: README + ship & self-score: AI (~1h): The mandatory README section, then the PR.

## Week 19: RAG foundations: embeddings, chunking & a vector DB

Program week 10 · [Knowledge Hub.AI: RAG & Vector DB](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/ai-rag-vectordb/README.md)

**Goals**

- Explain RAG: why retrieval grounds answers and reduces hallucinations
- Generate embeddings and run similarity search
- Run Qdrant in Compose and build an index from Knowledge Hub articles

**Tasks**

- [ ] **Read**: RAG, embeddings and vector databases (~3h): The theory behind semantic search and grounded generation. Ends with a 11-question test.
- [ ] **Code**: Warm-up: semantic search in 40 lines _(warm-up)_ (~1h): Embed 6 sentences, search them with cosine similarity in plain JS.
- [ ] **Project**: Project: Knowledge Hub RAG & Vector DB (~1h): Index articles into Qdrant, semantic search with filters, RAG chat with sources and memory.
- [ ] **Code**: Qdrant service in Docker Compose (~1h): Volume, healthcheck, restart, app depends on it.
- [ ] **Code**: Deterministic chunker (~1.5h): Size + overlap from env, stable output, unit-tested.
- [ ] **Code**: Embeddings + POST /ai/rag/index (~2.5h): Articles → chunks → embeddings → upsert into the collection.
- [ ] **Code**: DELETE /ai/rag/index/articles/:articleId (~0.5h): 204 or 404.
- [ ] **Code**: POST /ai/rag/search with metadata filters (~1.5h): Ranked chunks with attribution, filtered by status, category and tags.

## Week 20: RAG chat, consistency & the finish line

Program week 10 · [Knowledge Hub.AI: RAG & Vector DB](https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/ai-rag-vectordb/README.md)

**Goals**

- Build grounded prompts with correct source attribution
- Keep conversation memory and a consistent index
- Handle outages gracefully
- Finish the course and prepare for interviews

**Tasks**

- [ ] **Read**: Better retrieval: hybrid search and re-ranking (~1.5h): Optional techniques for the hacker scope. Ends with a 10-question test.
- [ ] **Code**: POST /ai/rag/chat: grounded answer + sources (~2.5h): Retrieve, then build the prompt, then generate, then attribute.
- [ ] **Code**: Conversation memory + history endpoint (~1h): Last N messages per conversationId.
- [ ] **Code**: Reindex consistency: no stale vectors (~1h): Updates and deletes always reflect in search.
- [ ] **Code**: Outage handling: 503 + logs (~1h): Stop Qdrant, break the key, and check the behavior.
- [ ] **Code**: Hacker scope: hybrid retrieval, re-ranking, incremental indexing (~3h): Pick at least one. Each is worth +10.
- [ ] **Code**: README + ship & self-score: RAG (~1h): The full startup flow from a fresh clone.
- [ ] **Read**: Bonus: Node.js & NestJS interview preparation (~4h): Review everything you built against common interview topics. Ends with a 12-question test.
