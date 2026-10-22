import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

const PROJECT = 'w12-prisma';

export const week12: Week = {
  id: 'w12',
  number: 12,
  programWeek: 6,
  title: 'PostgreSQL, SQL basics & Prisma ORM',
  short: 'SQL & Prisma',
  goals: [
    'Write basic SQL: DDL, joins, aggregation, indexes',
    'Model relations in Prisma: one-to-many, many-to-many and referential actions',
    'Replace in-memory storage with Prisma, using migrations, seed and transactions',
  ],
  modules: [programModule('rest/database-orm', 'REST service: Database & ORM')],
  tasks: [
    {
      id: 'w12-sql-read',
      kind: 'read',
      title: 'Databases, SQL and PostgreSQL',
      summary: 'Enough SQL to understand what your ORM generates.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: databases & ORM', url: 'https://youtu.be/qxaxVwetYfU', lang: 'RU' },
        { title: 'PostgreSQL tutorial (official)', url: 'https://www.postgresql.org/docs/current/tutorial.html' },
        { title: 'PostgreSQL docs', url: 'https://www.postgresql.org/docs/current/' },
        { title: 'node-postgres (pg)', url: 'https://node-postgres.com/' },
      ],
      questions: [
        'Primary key vs foreign key vs unique constraint?',
        'INNER vs LEFT JOIN: which one do you need for "articles with their (optional) category"?',
        'What do `ON DELETE CASCADE` and `ON DELETE SET NULL` do?',
        'What is an index, and when does it slow things down?',
        'What is a transaction? What do ACID and isolation levels mean?',
      ],
    },
    {
      id: 'w12-prisma-read',
      kind: 'read',
      title: 'Prisma ORM (and how TypeORM compares)',
      summary: 'Schema, client, migrations, relations.',
      estimateH: 2,
      resources: [
        { title: 'Prisma docs', url: 'https://www.prisma.io/docs/' },
        { title: 'Prisma: relations', url: 'https://www.prisma.io/docs/orm/prisma-schema/data-model/relations' },
        {
          title: 'Prisma: referential actions',
          url: 'https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions',
        },
        { title: 'Prisma: seeding', url: 'https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding' },
        { title: 'Prisma: transactions', url: 'https://www.prisma.io/docs/orm/prisma-client/queries/transactions' },
        { title: 'Prisma with NestJS', url: 'https://docs.nestjs.com/recipes/prisma' },
        { title: 'TypeORM (for comparison)', url: 'https://typeorm.io/' },
      ],
      questions: [
        'Implicit vs explicit many-to-many in Prisma?',
        '`migrate dev` vs `migrate deploy` vs `db push`: which one runs in the Docker container at startup?',
        'What is the N+1 problem, and how do `include`/`select` avoid it?',
        'What is `connectOrCreate` for?',
      ],
    },
    {
      id: 'w12-sql-queries',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: raw SQL in psql',
      summary: 'Five queries against your Compose database.',
      estimateH: 1,
      description: `\`docker compose exec db psql -U $POSTGRES_USER -d $POSTGRES_DB\`, then:
1. \`CREATE TABLE author (id serial PRIMARY KEY, name text NOT NULL)\` and \`book (id serial PK, title text, author_id int REFERENCES author(id) ON DELETE SET NULL)\`
2. Insert 3 authors and 6 books (one book without an author)
3. Books with author names (LEFT JOIN)
4. Number of books per author, including authors with 0 (GROUP BY)
5. Delete an author and check that the books' \`author_id\` is now NULL. Then \`EXPLAIN\` a query by \`author_id\` before and after \`CREATE INDEX\``,
      acceptance: [
        'All 5 queries written in a `sql-playground.sql` file',
        'You can read an `EXPLAIN` plan (Seq Scan vs Index Scan)',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Database & Prisma ORM',
      summary: 'Move the Knowledge Hub from in-memory storage to PostgreSQL via Prisma.',
      estimateH: 1,
      ...assignment('06b-database-prisma'),
      maxScore: 154,
      overview: `${KH_REPO_NOTE}

Replace in-memory storage with **PostgreSQL + Prisma**, reusing the Compose database from week 11. All routes, status codes and response shapes stay **the same**.`,
      requirements: [
        'TypeScript; Node.js 24.x (24.10.0+)',
        'PostgreSQL runs in Docker (reuse the week 11 setup)',
        '`DATABASE_URL` in `.env`; `.env.example` committed',
        ...PR_RULES,
      ],
      spec: `### Models (\`prisma/schema.prisma\`)
- \`User\`: id, login, password, role (enum ADMIN/EDITOR/VIEWER), createdAt, updatedAt
- \`Article\`: id, title, content, status (enum DRAFT/PUBLISHED/ARCHIVED), createdAt, updatedAt
- \`Category\`: id, name, description
- \`Comment\`: id, content, createdAt
- \`Tag\`: id, name (**unique**)

### Relations & referential actions
| relation | type | onDelete |
|---|---|---|
| User → Article (\`authorId\`) | 1-n | **SetNull** |
| User → Comment (\`authorId\`) | 1-n | **Cascade** |
| Category → Article (\`categoryId\`) | 1-n | **SetNull** |
| Article → Comment (\`articleId\`) | 1-n | **Cascade** |
| Article ↔ Tag | m-n | join rows removed |

### Migrations & seed
- \`npx prisma migrate dev\`. **Commit the migration files**
- \`prisma/seed.ts\` (\`npx prisma db seed\`): ≥ 2 users (admin + editor), ≥ 3 categories, ≥ 5 tags, ≥ 5 articles (mixed statuses, categories and tags), ≥ 3 comments

### Connection strings
- local app + docker db: \`postgresql://user:password@localhost:5432/knowledge_hub?schema=public\`
- docker app + docker db: \`postgresql://user:password@db:5432/knowledge_hub?schema=public\`

### Storage replacement
- Prisma Client queries replace the in-memory repositories
- Article \`tags\` go through the \`Tag\` model with **\`connectOrCreate\`**. The API still exposes \`tags: string[]\`
- Filtering uses Prisma \`where\` clauses
- \`prisma.$transaction\` for multi-step writes`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** all models · **+10** 1-n relations · **+10** m-n Article–Tag · **+10** migrations committed',
            '**+10** `DATABASE_URL` in .env (+ example) · **+10** Docker db from week 11 reused',
            '**+10** GET /user · **+10** GET /article (+ filters) · **+6** GET /category · **+6** GET /comment with the real DB',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+10** seed via `npx prisma db seed`',
            '**+10** onDelete rules',
            '**+10** transactions for complex operations',
            '**+10** `connectOrCreate` for tags',
          ],
        },
        {
          scope: 'Hacker',
          items: [
            '**+10** indexes (`Article.status`, `Article.categoryId`, `Tag.name`)',
            '**+6** connection pooling configured',
            '**+6** N+1 avoided with `include`',
          ],
        },
        { scope: 'Forfeits', items: [...PR_FORFEITS, '**−5** `.env` committed'] },
      ],
      deliverables: ['schema.prisma, migrations, seed.ts', 'Updated repositories / services', 'PR with self-score'],
    },
    {
      id: 'w12-prisma-schema',
      kind: 'code',
      title: 'Schema: models, enums, relations',
      summary: 'Translate the domain into schema.prisma.',
      estimateH: 2,
      projectId: PROJECT,
      points: 30,
      description: `\`npm i -D prisma && npm i @prisma/client && npx prisma init\`. Model everything from the spec. A sketch:
~~~prisma
model Article {
  id         String        @id @default(uuid())
  status     ArticleStatus @default(DRAFT)
  author     User?         @relation(fields: [authorId], references: [id], onDelete: SetNull)
  authorId   String?
  tags       Tag[]
  comments   Comment[]
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt
  // …
  @@index([status])
  @@index([categoryId])
}
~~~
The API uses \`number\` timestamps and lowercase enums. Map them in the repository layer (\`createdAt.getTime()\`, \`'published' ⇄ PUBLISHED\`).`,
      run: 'npx prisma format && npx prisma validate',
      acceptance: ['Schema validates', 'Every relation and onDelete rule from the table is present'],
    },
    {
      id: 'w12-prisma-migrate',
      kind: 'code',
      title: 'Migrations',
      summary: 'Generate, apply and commit SQL migrations.',
      estimateH: 0.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Start the db with `docker compose up db -d`, set `DATABASE_URL` to localhost, then run `npx prisma migrate dev --name init`. Read the generated SQL. In the app container, run `npx prisma migrate deploy` before starting (in the `CMD` or an entrypoint script).',
      run: 'npx prisma migrate dev --name init\ncat prisma/migrations/*/migration.sql | head -40',
      acceptance: [
        'The `migrations/` folder is committed',
        'A fresh `docker compose up` applies the migrations automatically',
      ],
    },
    {
      id: 'w12-prisma-seed',
      kind: 'code',
      title: 'Seed script',
      summary: 'Realistic data to develop against.',
      estimateH: 1,
      projectId: PROJECT,
      points: 10,
      description:
        'Write `prisma/seed.ts` with the minimum counts from the spec. Make it idempotent (`upsert`, or clean the tables first). Register it in `package.json` (`"prisma": { "seed": "tsx prisma/seed.ts" }`) or in `prisma.config.ts`, depending on your Prisma version.',
      run: 'npx prisma migrate reset   # drops, migrates and seeds\nnpx prisma studio',
      acceptance: ['`npx prisma db seed` works twice in a row', 'Data visible in Prisma Studio'],
    },
    {
      id: 'w12-prisma-repositories',
      kind: 'code',
      title: 'Prisma repositories replace the in-memory ones',
      summary: "Same interfaces, new implementation. Services don't change.",
      estimateH: 3,
      projectId: PROJECT,
      points: 52,
      description: `- \`PrismaService extends PrismaClient implements OnModuleInit\`, in a global \`PrismaModule\`
- \`PrismaUserRepository implements UserRepository\` etc. Switch the DI providers: \`useClass: PrismaUserRepository\`
- Tags: \`tags: { connectOrCreate: names.map((name) => ({ where: { name }, create: { name } })) }\`. On update use \`set: []\` first, inside the same call or transaction
- Filtering: \`where: { status, categoryId, tags: tag ? { some: { name: tag } } : undefined }\`
- Map Prisma errors: \`P2025\` (record not found) → 404, \`P2003\` (FK violation) → 422/400`,
      run: 'npm run test',
      acceptance: [
        'All provided integration tests still pass',
        'Responses look exactly like before (numbers for dates, lowercase enums, `tags: string[]`)',
      ],
    },
    {
      id: 'w12-prisma-cascades',
      kind: 'code',
      title: 'Cascades via onDelete + transactions',
      summary: 'Let the database enforce the rules.',
      estimateH: 1,
      projectId: PROJECT,
      points: 20,
      description:
        "Remove the manual cascade code from week 10, because the DB now does it with `onDelete`. Where an operation still takes several writes (for example replacing an article's tags and updating its fields), wrap them in `prisma.$transaction(async (tx) => { … })`.",
      acceptance: [
        'Deleting a user nullifies their articles and deletes their comments (check in Studio)',
        'At least one interactive transaction is used',
      ],
    },
    {
      id: 'w12-prisma-performance',
      kind: 'code',
      title: 'Hacker scope: indexes, pooling, no N+1',
      summary: 'Make the DB layer production-friendly.',
      estimateH: 1,
      projectId: PROJECT,
      points: 22,
      description:
        'Add `@@index` on `Article.status` and `Article.categoryId` (`Tag.name` is already unique, which means it is indexed). Configure pooling with `?connection_limit=10&pool_timeout=20` in `DATABASE_URL`. Load articles with `include: { tags: true }` in **one** query, and check by enabling `log: ["query"]` on the client.',
      acceptance: [
        'A new migration adds the indexes',
        'The query log shows one query (not 1 + N) for the article list',
      ],
    },
    {
      id: 'w12-prisma-ship',
      kind: 'code',
      title: 'Ship & self-score: Prisma',
      summary: 'Fresh clone → compose up → migrated, seeded, tests green.',
      estimateH: 0.5,
      projectId: PROJECT,
      description:
        'Test from a fresh clone: `cp .env.example .env && docker compose up --build`, then seed and run the tests. Update the README with the DB workflow (migrate, seed, studio). Open the PR with your self-score.',
      acceptance: ['Self-score written down (target ≥ 140/154)'],
    },
  ],
};
