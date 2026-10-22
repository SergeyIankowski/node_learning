import type { QuizQuestion } from '../types';
import { adv, basic, mid } from './q';

export const quizzes09to12: Record<string, QuizQuestion[]> = {
  'w09-nest-read': [
    basic(
      'Which decorator maps a controller method to `GET /user/:id`?',
      [
        '`@Route("GET", ":id")`',
        '*`@Get(":id")` inside `@Controller("user")`',
        '`@Param(":id")`',
        '`@Http.get(":id")`',
      ],
      'The controller prefix plus the method decorator path give the route.',
    ),
    basic(
      'What is a **provider** in Nest?',
      [
        'Any npm package',
        "*A class (usually `@Injectable()`) that Nest's DI container can create and inject",
        'A route handler',
        'A database connection string',
      ],
      'Services, repositories, helpers, guards and pipes can all be providers.',
    ),
    basic(
      'What does a `@Module()` declare?',
      [
        'Only routes',
        '*Its controllers, providers, imported modules and exported providers',
        'Environment variables',
        'Database tables',
      ],
      'Modules are the unit of encapsulation in Nest.',
    ),
    basic(
      'Which runs **first** for an incoming request?',
      ['Pipes', 'Guards', '*Middleware', 'Interceptors'],
      'Order: middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → exception filters (on error).',
    ),
    mid(
      '`CommentModule` needs `ArticleService` from `ArticleModule`. What is required?',
      [
        'Nothing, all providers are global',
        '*`ArticleModule` lists `ArticleService` in `exports`, and `CommentModule` imports `ArticleModule`',
        'Copy `ArticleService` into `CommentModule.providers`',
        'Use `new ArticleService()`',
      ],
      'Copying the provider creates a **second** instance with separate state, which is a classic bug.',
    ),
    mid(
      'When do you need `@Inject(USER_REPOSITORY)` on a constructor parameter?',
      [
        'Always',
        'Never',
        'Only for controllers',
        '*When the dependency is registered under a non-class token (Symbol or string), for example to inject by interface',
      ],
      "Interfaces don't exist at runtime, so a token stands in for them.",
    ),
    mid(
      'What do `ValidationPipe({ whitelist: true, transform: true })` options do?',
      [
        '*`whitelist` strips properties without validation decorators; `transform` turns payloads into DTO class instances and converts primitive types',
        'Both only affect error messages',
        '`whitelist` allows any property',
        '`transform` encrypts the body',
      ],
      'Add `forbidNonWhitelisted: true` to reject unknown properties instead of stripping them.',
    ),
    mid(
      'Which run **before** the route handler?',
      ['*Guards', '*Pipes', '*The "before" part of interceptors', 'Exception filters'],
      'Filters only run when an exception is thrown.',
    ),
    mid(
      "What is a **guard**'s job?",
      [
        'Transform the response',
        'Validate the body',
        '*Decide whether the request may proceed (return true or false, or throw), usually for authentication or authorization',
        'Log requests',
      ],
      'Guards have access to the `ExecutionContext`, so they can read route metadata like `@Roles()`.',
    ),
    adv(
      '"Nest can\'t resolve dependencies of the ArticleService (?)". What is the most common cause?',
      [
        'A typo in the route path',
        "*The dependency isn't available in that module: not provided, not exported or imported, or a circular import made it `undefined`",
        'Missing `async`',
        "Swagger isn't installed",
      ],
      "The `?` marks the parameter position Nest couldn't resolve.",
    ),
    adv(
      'What is the **default** provider scope, and what does `Scope.REQUEST` cost?',
      [
        'Transient; nothing',
        '*Singleton; request scope creates new instances per request, and that bubbles up to everything depending on it',
        'Request; singletons are slower',
        'Module; nothing',
      ],
      'Keep providers singleton unless you truly need per-request state.',
    ),
    adv(
      'Why register a global pipe through the `APP_PIPE` provider instead of `app.useGlobalPipes()`?',
      [
        'It is faster',
        '*A pipe registered as a provider can use dependency injection; `useGlobalPipes` instances are created outside the DI container',
        'useGlobalPipes is deprecated',
        'APP_PIPE also validates responses',
      ],
      'The same applies to `APP_GUARD`, `APP_INTERCEPTOR` and `APP_FILTER`. That is how the global JWT guard gets `JwtService` and `Reflector`.',
    ),
  ],

  'w09-rest-read': [
    basic(
      'What belongs in a **controller**?',
      [
        'SQL queries',
        '*HTTP concerns: routes, params, status codes, then delegating to a service',
        'Business rules like cascades',
        'Password hashing',
      ],
      'Thin controllers keep business logic reusable and testable.',
    ),
    basic(
      'PUT vs PATCH?',
      [
        'Same thing',
        'PATCH creates, PUT updates',
        'PUT is for collections only',
        '*PUT replaces the whole resource; PATCH applies a partial update',
      ],
      "Many APIs (like this course's) use PUT for partial updates anyway. Know the convention, and document what you do.",
    ),
    basic(
      'Which URI design is RESTful?',
      [
        '`POST /createArticle`',
        '`GET /getArticle?id=5`',
        '*`GET /articles/5`, `DELETE /articles/5`',
        '`POST /articles/5/delete`',
      ],
      'Nouns for resources, HTTP methods for actions.',
    ),
    basic(
      'What does the REST "stateless" constraint mean?',
      [
        'The server has no database',
        '*Each request carries everything needed to process it; the server keeps no client session between requests',
        'Responses are never cached',
        'Only GET is allowed',
      ],
      'This is why JWTs travel with every request.',
    ),
    mid(
      "A comment references an `articleId` that doesn't exist. Why 422 rather than 404?",
      [
        "*The `/comment` endpoint exists and the body is well-formed, but it refers to an entity that can't be processed",
        '404 is only for GET',
        '422 is the default for POST',
        'There is no difference',
      ],
      '404 would suggest the endpoint or the target resource is missing.',
    ),
    mid(
      'What should a successful DELETE return?',
      ['201', '*204 with no body (or 200 with a body)', '202 always', '404'],
      'This course requires 204.',
    ),
    mid(
      'Which responsibilities belong in the **service** layer?',
      [
        '*Business rules such as cascading behavior',
        '*Checking existence and throwing a not-found error',
        'Parsing route parameters',
        '*Calling the repository',
      ],
      'Parameter parsing and validation belong to pipes and controllers.',
    ),
    mid(
      'Why put a repository layer behind an interface?',
      [
        'It is required by Nest',
        'For better performance',
        '*The data source can change (in-memory → Prisma) without touching services',
        'To generate Swagger',
      ],
      'This pays off in week 12.',
    ),
    adv(
      'A client sends the same DELETE twice: 204, then 404. Is DELETE still idempotent?',
      [
        'No, because the responses differ',
        '*Yes, idempotency is about server **state**, and the state is the same after one or two calls',
        'Only if both return 204',
        'DELETE is never idempotent',
      ],
      'Responses may differ. The effect on the resource must not.',
    ),
    adv(
      'Why include `total` in a paginated response?',
      [
        'Required by HTTP',
        '*Clients can compute the number of pages and show "x of y" without extra requests',
        'For caching',
        'To validate `limit`',
      ],
      'A common envelope is `{ data, total, page, limit }`, as in the hacker scope.',
    ),
    adv(
      'What is HATEOAS?',
      [
        'A JSON schema format',
        '*Responses include hypermedia links to related resources and available actions',
        'A caching header',
        'An authentication method',
      ],
      'It is the least commonly implemented REST constraint. Good to know for interviews.',
    ),
  ],

  'w10-swagger-read': [
    basic(
      'What does `SwaggerModule.setup("doc", app, document)` do?',
      [
        '*Serves the Swagger UI (and JSON spec) at `/doc`',
        'Validates requests',
        'Generates DTOs',
        'Writes `openapi.yaml` to disk only',
      ],
      'The assignment requires the docs at `/doc`.',
    ),
    basic(
      'What does `@ApiTags("user")` do?',
      [
        'Protects routes',
        "*Groups the controller's endpoints under a section in the UI",
        'Adds query params',
        'Sets the base path',
      ],
      'Purely documentation.',
    ),
    basic(
      'What is the relationship between Swagger and OpenAPI?',
      [
        'Competing standards',
        '*OpenAPI is the specification; Swagger is the tooling (UI, editor) around it',
        'Swagger is newer',
        'OpenAPI is Nest-only',
      ],
      'Swagger 2.0 was renamed OpenAPI with version 3.',
    ),
    basic(
      'What does `@ApiProperty()` on a DTO property do?',
      [
        'Validates it',
        '*Describes it in the generated schema',
        'Makes it required at runtime',
        'Excludes it from responses',
      ],
      'Validation still needs class-validator decorators.',
    ),
    mid(
      'Why import `PartialType` from `@nestjs/swagger` instead of `@nestjs/mapped-types`?',
      [
        'It is faster',
        'mapped-types is deprecated',
        '*The swagger version also carries the OpenAPI metadata over, so the docs show the fields',
        'They are identical',
      ],
      'Both copy validation rules, but only the swagger one keeps the docs correct.',
    ),
    mid(
      'What does the Swagger **CLI plugin** (configured in `nest-cli.json`) do?',
      [
        '*It generates `@ApiProperty` metadata from TypeScript types at compile time, so you write far fewer decorators',
        'It runs Swagger in a separate process',
        'It validates responses',
        'It deploys the docs',
      ],
      'It reads property types and optionality from your DTO classes.',
    ),
    mid(
      'How do you exclude `password` from responses with class-transformer?',
      [
        '`delete user.password` in every controller',
        'Mark it `private`',
        '*`@Exclude()` on the entity property plus `ClassSerializerInterceptor`, returning class instances',
        'Use `@ApiHideProperty()`',
      ],
      '`@ApiHideProperty` only hides it from the **docs**, not from responses.',
    ),
    mid(
      'What can `@ApiResponse()` document?',
      ['*A status code', '*A description', '*The response body type', 'A rate limit that the decorator enforces'],
      'Decorators in `@nestjs/swagger` only document. They never enforce anything.',
    ),
    adv(
      'How do you make an enum field show as a dropdown in Swagger UI?',
      [
        'It happens automatically for strings',
        '*`@ApiProperty({ enum: UserRole })`, or let the CLI plugin infer it',
        'Use `@IsEnum()` only',
        'Use a union type',
      ],
      '`@IsEnum` validates. `@ApiProperty({ enum })` documents.',
    ),
    adv(
      'Why must DTOs be **classes** rather than interfaces?',
      [
        'Interfaces are slower',
        '*Interfaces are erased at runtime, while validation and Swagger read decorator metadata from classes',
        'Classes are shorter',
        'Nest forbids interfaces',
      ],
      'This is also why `transform: true` can produce real DTO instances.',
    ),
    adv(
      'What does `OmitType(CreateUserDto, ["password"])` produce?',
      [
        'A type alias only',
        '*A new class with every property except `password`, keeping its validators and Swagger metadata',
        'A runtime error',
        'A copy with `password` optional',
      ],
      'Mapped types (`PartialType`, `PickType`, `OmitType`, `IntersectionType`) compose DTOs without duplication.',
    ),
  ],

  'w11-docker-read': [
    basic(
      'What is the difference between an image and a container?',
      [
        '*An image is a read-only template; a container is a running (or stopped) instance of it with its own writable layer',
        'Same thing',
        'A container builds images',
        'Images run, containers are stored',
      ],
      'Changes made inside a container are lost when it is removed, unless they are written to a volume.',
    ),
    basic(
      'What does `EXPOSE 4000` do?',
      [
        'Publishes port 4000 on the host',
        'Opens the firewall',
        'Starts a server',
        '*Documents that the container listens on 4000; publishing needs `-p` or `ports:`',
      ],
      'EXPOSE is metadata only.',
    ),
    basic(
      'How does the `app` service reach PostgreSQL in the same Compose network?',
      [
        '*By the service name as hostname: `db:5432`',
        'Through `localhost:5432`',
        "Through the host's IP",
        "It can't without links",
      ],
      'Inside a container, `localhost` is the container itself.',
    ),
    basic(
      'What does `-p 8080:80` mean?',
      [
        'Container port 8080 → host 80',
        '*Host port 8080 → container port 80',
        'Both ports open in the container',
        'Rate limit of 8080 requests per 80 seconds',
      ],
      'The format is `HOST:CONTAINER`.',
    ),
    mid(
      'Why copy `package*.json` and run `npm ci` **before** `COPY . .`?',
      [
        'npm needs an empty folder',
        'For security',
        '*Layer caching: dependencies are reinstalled only when the manifests change, not on every source edit',
        "The order doesn't matter",
      ],
      'Each instruction is a cached layer. A change invalidates that layer and everything after it.',
    ),
    mid(
      'Why a **named volume** for PostgreSQL data instead of a bind mount?',
      [
        'Bind mounts are not allowed for databases',
        '*Docker manages it, it survives container removal, and it avoids host path and permission issues',
        'Named volumes are faster in all cases',
        'Named volumes are encrypted',
      ],
      'Bind mounts are great for source code in development, less so for database files.',
    ),
    mid(
      'What do you gain from a **multi-stage** build?',
      [
        '*A final image with only runtime artifacts: smaller, faster to pull, smaller attack surface',
        'Parallel builds only',
        'Automatic tests',
        'Hot reload',
      ],
      'Compilers, dev dependencies and sources stay in the build stage.',
    ),
    mid(
      'What belongs in `.dockerignore`?',
      ['*`node_modules`', '*`.env`', '*`.git`', '`package-lock.json`'],
      'The lockfile is **needed** by `npm ci` inside the image.',
    ),
    adv(
      'What is the difference between `CMD` and `ENTRYPOINT`?',
      [
        'They are aliases',
        'CMD runs at build time',
        'ENTRYPOINT can be overridden by `docker run image something`',
        '*ENTRYPOINT is the fixed executable; CMD is the default command or arguments, which `docker run image <cmd>` replaces',
      ],
      'Combined, CMD supplies the default arguments to ENTRYPOINT.',
    ),
    adv(
      'What does `depends_on: [db]` **without** a condition guarantee?',
      [
        'The DB accepts connections',
        '*Only that the db container was started first, not that PostgreSQL is ready',
        'Nothing at all',
        'That migrations ran',
      ],
      'Use a `healthcheck` on db and `condition: service_healthy`.',
    ),
    adv(
      'Why `CMD ["node", "dist/main.js"]` (exec form) instead of `CMD npm start`?',
      [
        'It is shorter',
        '*Node runs as PID 1 and receives SIGTERM directly, so graceful shutdown works; npm or sh may not forward signals',
        "npm isn't installed in alpine",
        'Exec form is cached',
      ],
      'Otherwise `docker stop` waits 10 s, then SIGKILLs your app.',
    ),
  ],

  'w12-sql-read': [
    basic(
      'What is a primary key?',
      [
        "*A column (or set of columns) that uniquely identifies each row and can't be NULL",
        'The first column',
        'An encrypted column',
        'An index on a foreign table',
      ],
      'In this project, uuid `id` columns.',
    ),
    basic(
      'What does a foreign key enforce?',
      [
        'Uniqueness',
        '*That a value refers to an existing row in another table (referential integrity)',
        'A default value',
        'An index',
      ],
      'For example `article.author_id` → `user.id`.',
    ),
    basic(
      'What does `articles LEFT JOIN categories` return?',
      [
        'Only articles with a category',
        'Only categories',
        '*All articles; category columns are NULL where there is no match',
        'A cartesian product',
      ],
      'INNER JOIN would drop articles without a category.',
    ),
    basic(
      'What does `ON DELETE SET NULL` do?',
      [
        '*When the parent row is deleted, the foreign key in child rows becomes NULL',
        'Deletes the children',
        'Prevents the delete',
        'Sets the parent to NULL',
      ],
      'That is exactly the "user deleted → `article.authorId = null`" rule.',
    ),
    mid(
      'What is the cost of an index?',
      [
        'None',
        'It slows reads',
        '*Writes get slower (the index has to be updated) and it takes disk space',
        'It locks the table',
      ],
      'Index columns you filter or join on frequently, not everything.',
    ),
    mid(
      'Counting books per author with a LEFT JOIN: why `COUNT(b.id)` instead of `COUNT(*)`?',
      [
        'It is faster',
        '*`COUNT(column)` ignores NULLs, so authors with no books get 0 instead of 1',
        "`COUNT(*)` isn't allowed with GROUP BY",
        'No difference',
      ],
      'The NULL-extended row still counts as a row for `COUNT(*)`.',
    ),
    mid(
      'What does each letter in ACID stand for?',
      ['*Atomicity', '*Consistency', '*Isolation', '*Durability', 'Availability'],
      'Availability belongs to the CAP theorem, not ACID.',
    ),
    mid(
      'Which scenario needs a **transaction**?',
      [
        'A single SELECT',
        '*Moving money: debit one account and credit another, both or neither',
        'Creating an index',
        'Reading a config row',
      ],
      'Atomicity: if the second statement fails, the first is rolled back.',
    ),
    adv(
      'How do you prevent SQL injection with node-postgres?',
      [
        'Escape quotes manually',
        'Validate that ids are short',
        '*Parameterized queries: `client.query("SELECT * FROM users WHERE id = $1", [id])`',
        'Use template literals',
      ],
      'Parameters are sent separately from the SQL text, so they are never parsed as SQL. ORMs do this for you.',
    ),
    adv(
      '`EXPLAIN` shows a Seq Scan even though the column has an index. Why might that be correct?',
      [
        'The index is broken',
        '*For small tables or low-selectivity filters, reading the whole table is cheaper than index lookups',
        'PostgreSQL ignores indexes on uuid',
        'EXPLAIN always shows Seq Scan',
      ],
      'The planner is cost-based. Test with realistic data volumes.',
    ),
    adv(
      'An author has no books. What count does this return for them?\n\n~~~sql\nSELECT a.name, COUNT(*)\nFROM author a LEFT JOIN book b ON b.author_id = a.id\nGROUP BY a.name;\n~~~',
      ['0', '*1', 'NULL', 'The author is missing from the result'],
      'LEFT JOIN produces one row for the author with NULL book columns, and `COUNT(*)` counts it.',
    ),
  ],

  'w12-prisma-read': [
    basic(
      'What does `schema.prisma` contain?',
      [
        'Migration SQL',
        '*The datasource, the client generator and your data models: the single source of truth',
        'Seed data',
        'Environment variables',
      ],
      'Migrations are generated from it.',
    ),
    basic(
      'Which command applies migrations in **production** (for example at container start)?',
      ['`prisma migrate dev`', '`prisma db push`', '`prisma migrate reset`', '*`prisma migrate deploy`'],
      '`deploy` only applies existing migrations. It never generates new ones or resets data.',
    ),
    basic(
      'When must you run `prisma generate`?',
      [
        'Never',
        '*After schema changes, to regenerate the typed client (`migrate dev` runs it for you)',
        'Before every query',
        'Only in production',
      ],
      'The generated client is what gives you type-safe queries.',
    ),
    basic(
      'What is Prisma Studio?',
      ['A cloud host', 'An IDE plugin', '*A local GUI to browse and edit your database data', 'A migration tool'],
      'Run `npx prisma studio`.',
    ),
    mid(
      'What distinguishes an **implicit** many-to-many relation?',
      [
        '*Prisma creates and manages the join table (for example `_ArticleToTag`); you only declare `Tag[]` and `Article[]` fields',
        'You define the join model yourself',
        'It needs raw SQL',
        'It allows extra fields on the relation',
      ],
      'An explicit relation table is needed when the relation has its own fields, such as `addedAt`.',
    ),
    mid(
      'What is the **N+1 problem**?',
      [
        'Too many indexes',
        '*One query for a list, then one more query per item to load its relations',
        'An off-by-one pagination bug',
        'Running N migrations',
      ],
      'Fix it with `include`/`select` (a single query or a batched follow-up) instead of a loop.',
    ),
    mid(
      'What does `connectOrCreate` do?',
      [
        'Creates a DB connection',
        "*Connects an existing related record by a unique field, or creates it if it doesn't exist",
        'Upserts the parent',
        'Reconnects after failure',
      ],
      'Ideal for tags: `{ where: { name }, create: { name } }`.',
    ),
    mid(
      'Which are valid Prisma `onDelete` referential actions?',
      ['*`Cascade`', '*`SetNull`', '*`Restrict`', '`DeleteAll`'],
      'Also `NoAction` and `SetDefault`.',
    ),
    adv(
      'What does `prisma.$transaction(async (tx) => { … })` guarantee?',
      [
        'Faster queries',
        '*All queries made through `tx` commit together or roll back together',
        'Automatic retries',
        'Read-only access',
      ],
      'Use `tx`, not `prisma`, inside the callback, or the query runs outside the transaction.',
    ),
    adv(
      'What does Prisma error `P2025` mean, and how should the API respond?',
      [
        'Unique constraint failed → 409',
        "*A required record wasn't found (for example update or delete of a missing id) → 404",
        'Connection error → 503',
        'Foreign key failed → 422',
      ],
      'Unique violation is `P2002`. Foreign key violation is `P2003`.',
    ),
    adv(
      '`prisma migrate dev` vs `prisma db push`?',
      [
        'Same thing',
        '*`migrate dev` creates versioned migration SQL files; `db push` syncs the schema directly without migration history (good for prototyping)',
        '`db push` is for production',
        "`migrate dev` doesn't touch the database",
      ],
      'The assignment requires committed migration files, so use `migrate dev`.',
    ),
  ],
};
