import { assignment, PR_RULES, programModule } from '../links';
import type { Week } from '../types';

export const KH_PROJECT = 'w09-kh-api';

/** Shared note for every Knowledge Hub follow-up project. */
export const KH_REPO_NOTE =
  "This continues the **Knowledge Hub API** repository you created in week 9 (assignment `05`). Keep the course's integration tests green after every change.";

export const week09: Week = {
  id: 'w09',
  number: 9,
  programWeek: 5,
  title: 'Nest.js fundamentals & Knowledge Hub API (users, categories)',
  short: 'Nest.js basics',
  goals: [
    'Understand Nest building blocks: modules, controllers, providers, DI, pipes, guards, interceptors',
    'Design a storage layer you can swap for a database later',
    'Implement the User and Category resources with DTO validation',
  ],
  modules: [programModule('rest/rest', 'REST service')],
  tasks: [
    {
      id: 'w09-nest-read',
      kind: 'read',
      title: 'Nest.js core concepts',
      summary: 'Read the "Overview" section of the docs end to end.',
      estimateH: 4,
      resources: [
        { title: 'Nest.js documentation: First steps', url: 'https://docs.nestjs.com/first-steps' },
        { title: 'Controllers', url: 'https://docs.nestjs.com/controllers' },
        { title: 'Providers & DI', url: 'https://docs.nestjs.com/providers' },
        { title: 'Modules', url: 'https://docs.nestjs.com/modules' },
        { title: 'Middleware', url: 'https://docs.nestjs.com/middleware' },
        { title: 'Pipes & validation', url: 'https://docs.nestjs.com/techniques/validation' },
        { title: 'Guards', url: 'https://docs.nestjs.com/guards' },
        { title: 'Interceptors', url: 'https://docs.nestjs.com/interceptors' },
        { title: 'Exception filters', url: 'https://docs.nestjs.com/exception-filters' },
        { title: 'Lecture: Nest.js, part 1', url: 'https://www.youtube.com/watch?v=Rv9SinVHlPs', lang: 'RU' },
        { title: 'Lecture: Nest.js, part 2', url: 'https://www.youtube.com/watch?v=jex6cM1xHng', lang: 'RU' },
        { title: 'Nest.js Q&A', url: 'https://youtu.be/uOzo8ZdEWqI', lang: 'RU' },
      ],
      questions: [
        'What is the request lifecycle order: middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → filters?',
        'How does Nest know what to inject? What is an injection token, and when do you need `@Inject(TOKEN)`?',
        'What does `exports` in a module do? Why do you get "Nest can\'t resolve dependencies of …"?',
        'What does `ValidationPipe({ whitelist: true, transform: true })` do?',
      ],
    },
    {
      id: 'w09-rest-read',
      kind: 'read',
      title: 'REST and layered architecture',
      summary: 'Resources, verbs, status codes, and why controllers should stay thin.',
      estimateH: 1,
      resources: [
        {
          title: 'Representational state transfer',
          url: 'https://en.wikipedia.org/wiki/Representational_state_transfer',
        },
        {
          title: 'Microsoft: RESTful web API design',
          url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
        },
      ],
      questions: [
        'What belongs in a controller, a service and a repository?',
        'Why return 422 (not 400 or 404) when a comment references a missing article?',
      ],
    },
    {
      id: 'w09-nest-hello',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: Notes module with DTO validation',
      summary: 'Generate a Nest app, add one resource end to end.',
      estimateH: 1.5,
      description: `\`npx @nestjs/cli new notes-playground\`, then \`nest g resource notes\` (REST, no CRUD entry points), and write it by hand:
- \`CreateNoteDto { @IsString() @IsNotEmpty() title; @IsOptional() @IsString() body }\`
- global \`ValidationPipe({ whitelist: true })\`
- \`GET /notes/:id\` with \`ParseUUIDPipe\`
- a \`NotesService\` holding a \`Map\`, injected into the controller`,
      run: 'npm run start:dev\ncurl -i -X POST localhost:3000/notes -H "content-type: application/json" -d \'{}\'',
      expected:
        'HTTP/1.1 400 Bad Request\n{"message":["title should not be empty","title must be a string"],"error":"Bad Request","statusCode":400}',
      acceptance: ['Invalid body → 400 with messages', 'Invalid uuid → 400', 'You understand each generated file'],
    },
    {
      id: KH_PROJECT,
      kind: 'project',
      title: 'Project: Nest.js Knowledge Hub API',
      summary: 'Users, articles, categories and comments with in-memory storage, validation, Swagger and cascades.',
      estimateH: 1,
      ...assignment('05-kh-rest-api'),
      starterRepo: 'https://github.com/rolling-scopes-school/nodejs-course-template',
      maxScore: 712,
      overview: `A REST API for a **Knowledge Hub**, where users create articles, organize them by category and tag, and comment on them.

**This repository is the base for weeks 9–20.** Docker, Prisma, auth, tests, logging and AI all build on it. Organize modules so the data source can be swapped later.

Create it **from the template** and name it after the course period, for example \`nodejs-2026q4-knowledge-hub\`. The template contains integration tests: **+10 for each passing test**, and **−670** if you change them.

This plan splits it over **weeks 9–10**.`,
      requirements: [
        'TypeScript + Nest.js; Node.js 24.x (24.10.0+)',
        'Start with `npm start`. `PORT` (default 4000) in `.env`',
        'Lint passes with the local config (−10 per error)',
        ...PR_RULES,
      ],
      spec: `### Entities
~~~ts
interface User { id: string; login: string; password: string; role: 'admin'|'editor'|'viewer'; createdAt: number; updatedAt: number }
interface Article { id: string; title: string; content: string; status: 'draft'|'published'|'archived';
  authorId: string|null; categoryId: string|null; tags: string[]; createdAt: number; updatedAt: number }
interface Category { id: string; name: string; description: string }
interface Comment { id: string; content: string; articleId: string; authorId: string|null; createdAt: number }
~~~

### Endpoints
| Route | Notes |
|---|---|
| \`GET/POST /user\`, \`GET/PUT/DELETE /user/:id\` | POST \`{ login, password, role? = viewer }\`. PUT \`{ oldPassword, newPassword }\` → **403** on a wrong old password. Never return \`password\` |
| \`GET/POST /article\`, \`GET/PUT/DELETE /article/:id\` | Required \`title\`, \`content\`. \`GET /article?status=&categoryId=&tag=\` filters |
| \`GET/POST /category\`, \`GET/PUT/DELETE /category/:id\` | Required \`name\`, \`description\` |
| \`GET /comment?articleId=\`, \`POST /comment\`, \`DELETE /comment/:id\` | POST requires \`content\` and \`articleId\`. A missing article → **422** |

Common rules: invalid uuid → 400; not found → 404; created → 201; deleted → 204; JSON bodies.

### Cascades
- Delete a **User** → their articles get \`authorId = null\`, and their comments are deleted
- Delete a **Category** → its articles get \`categoryId = null\`
- Delete an **Article** → its comments are deleted

### Architecture
- One Nest module per domain (\`UserModule\`, \`ArticleModule\`, \`CategoryModule\`, \`CommentModule\`), each with a controller and a service
- DTO classes + class-validator; a global \`ValidationPipe\`
- Middleware, interceptors or guards for cross-cutting concerns such as request logging
- \`@nestjs/swagger\` docs at **\`/doc\`**
- Enums for \`UserRole\` and \`ArticleStatus\``,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** README',
            '**+10** each: User · Article · Category · Comment modules',
            '**+10** for each passing test',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+16** DTO validation everywhere',
            '**+10** article filtering',
            '**+16** Swagger at `/doc`',
            '**+10** cascades',
          ],
        },
        {
          scope: 'Hacker',
          items: [
            '**+10** pagination (`page`, `limit` → `{ total, page, limit, data }`)',
            '**+10** sorting (`sortBy`, `order`)',
            '**+10** additional automated tests',
          ],
        },
        {
          scope: 'Forfeits',
          items: [
            '**−670** changes in the provided tests',
            '**−30% of max** commits after deadline',
            '**−20** no dev branch · **−20** no PR · **−10** bad PR description',
            '**−10** per lint error',
            '**−20** fewer than 3 commits',
          ],
        },
      ],
      deliverables: ['Repository `nodejs-<period>-knowledge-hub` created from the template', 'PR with self-score'],
    },
    {
      id: 'w09-kh-setup',
      kind: 'code',
      title: 'Repo from template, config, global validation',
      summary: 'Run the provided tests first, so you know your baseline.',
      estimateH: 1,
      projectId: KH_PROJECT,
      description: `1. Create the repository from the template and install dependencies. Read its README to learn how to run the integration tests.
2. \`@nestjs/config\` with \`.env\` / \`.env.example\` (\`PORT=4000\`).
3. In \`main.ts\`: \`app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))\`.
4. Run the test suite. Everything fails, which is your baseline. Then commit.`,
      run: 'npm start\nnpm run test   # see template README for the exact test command',
      acceptance: [
        'The app listens on 4000 from `.env`',
        'You know how to run the provided tests',
        'A dev branch exists',
      ],
    },
    {
      id: 'w09-kh-storage',
      kind: 'code',
      title: 'Storage layer you can swap later',
      summary: 'Repository interfaces + in-memory implementations behind DI tokens.',
      estimateH: 1.5,
      projectId: KH_PROJECT,
      description: `Define one interface per entity, for example
~~~ts
export interface UserRepository {
  findAll(): Promise<User[]>; findById(id: string): Promise<User | undefined>;
  create(data: Omit<User, 'id'>): Promise<User>; update(id: string, patch: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
~~~
and an \`InMemoryUserRepository\`, provided with \`{ provide: USER_REPOSITORY, useClass: InMemoryUserRepository }\`. **Make the methods async now.** In week 12 Prisma replaces them without touching the services.`,
      acceptance: ['Services depend on interfaces + tokens, not on `Map`s', 'All repository methods return Promises'],
    },
    {
      id: 'w09-kh-users',
      kind: 'code',
      title: 'UserModule',
      summary: 'CRUD, password never returned, 403 on a wrong old password.',
      estimateH: 2,
      projectId: KH_PROJECT,
      points: 10,
      description: `- \`CreateUserDto\`: \`login\`, \`password\` (strings, required), \`role?\` (\`@IsEnum(UserRole)\`, default \`viewer\`)
- \`UpdatePasswordDto\`: \`oldPassword\`, \`newPassword\`
- \`ParseUUIDPipe\` on \`:id\`
- Strip \`password\` from **every** response: a \`toResponse()\` mapper, \`ClassSerializerInterceptor\` with \`@Exclude()\`, or your own interceptor
- \`createdAt\` / \`updatedAt\` as \`Date.now()\` timestamps. \`updatedAt\` changes on password update`,
      run: 'curl -s -X POST localhost:4000/user -H "content-type: application/json" -d \'{"login":"ann","password":"p"}\'',
      expected: '{"id":"…","login":"ann","role":"viewer","createdAt":…,"updatedAt":…}',
      acceptance: ['No `password` in any response', 'Wrong `oldPassword` → 403', 'User tests from the template pass'],
    },
    {
      id: 'w09-kh-categories',
      kind: 'code',
      title: 'CategoryModule',
      summary: 'The simplest resource: practise the pattern.',
      estimateH: 1,
      projectId: KH_PROJECT,
      points: 10,
      description:
        'Full CRUD on `/category` with `CreateCategoryDto { name, description }` (both required) and `UpdateCategoryDto` (`PartialType` from `@nestjs/swagger`). Same 400, 404, 201 and 204 rules.',
      acceptance: ['Category tests from the template pass'],
    },
  ],
};
