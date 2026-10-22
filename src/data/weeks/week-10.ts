import { programModule } from '../links';
import type { Week } from '../types';
import { KH_PROJECT } from './week-09';

export const week10: Week = {
  id: 'w10',
  number: 10,
  programWeek: 5,
  title: 'Knowledge Hub API: articles, comments, cascades & Swagger',
  short: 'Articles & Swagger',
  goals: [
    'Implement filtering, relations between resources and cascades in the service layer',
    'Add cross-cutting concerns with middleware and interceptors',
    'Document the API with OpenAPI at /doc',
    'Pass all provided tests with zero lint errors',
  ],
  modules: [programModule('rest/rest', 'REST service')],
  tasks: [
    {
      id: 'w10-swagger-read',
      kind: 'read',
      title: 'OpenAPI with @nestjs/swagger, serialization',
      summary: 'Generate docs from your DTOs.',
      estimateH: 1,
      resources: [
        { title: 'Nest: OpenAPI introduction', url: 'https://docs.nestjs.com/openapi/introduction' },
        { title: 'Nest: OpenAPI types and parameters', url: 'https://docs.nestjs.com/openapi/types-and-parameters' },
        { title: 'Nest: serialization', url: 'https://docs.nestjs.com/techniques/serialization' },
        { title: 'Nest: mapped types (PartialType, OmitType)', url: 'https://docs.nestjs.com/openapi/mapped-types' },
      ],
      questions: [
        'How does the Swagger CLI plugin infer properties from DTOs?',
        'Why import `PartialType` from `@nestjs/swagger` and not `@nestjs/mapped-types`?',
      ],
    },
    {
      id: 'w10-kh-articles',
      kind: 'code',
      title: 'ArticleModule + filtering',
      summary: 'GET /article?status=&categoryId=&tag=',
      estimateH: 2,
      projectId: KH_PROJECT,
      points: 20,
      description: `- \`CreateArticleDto\`: \`title\`, \`content\` (required); \`status?\` (\`@IsEnum(ArticleStatus)\`, default \`draft\`); \`authorId?\`, \`categoryId?\` (\`@IsUUID()\`, nullable); \`tags?: string[]\`
- \`ArticleQueryDto\` validates the query params. All filters combine with AND
- Do the filtering in the **service/repository**, not the controller`,
      run: 'curl -s "localhost:4000/article?status=published&tag=nodejs"',
      acceptance: ['Each filter works alone and combined with the others', 'Article tests pass'],
    },
    {
      id: 'w10-kh-comments',
      kind: 'code',
      title: 'CommentModule',
      summary: 'Required articleId query, 422 for a missing article.',
      estimateH: 1,
      projectId: KH_PROJECT,
      points: 10,
      description:
        "`GET /comment?articleId=` (required and a uuid, otherwise 400), `POST /comment { content, articleId, authorId? }` (the article doesn't exist → **422** `UnprocessableEntityException`), `DELETE /comment/:id`. `CommentService` injects `ArticleService` (or its repository) to check the article exists. Export it from `ArticleModule`.",
      acceptance: [
        '422 vs 400 vs 404 are all correct',
        'No circular-dependency errors (use `forwardRef` only if you really need it)',
      ],
    },
    {
      id: 'w10-kh-cascades',
      kind: 'code',
      title: 'Cascading deletes',
      summary: 'Nullify or remove dependent records.',
      estimateH: 1,
      projectId: KH_PROJECT,
      points: 10,
      description:
        'User delete → `authorId = null` on their articles, and delete their comments. Category delete → `categoryId = null` on its articles. Article delete → delete its comments. Write these as repository methods (`nullifyAuthor(userId)`, `deleteByArticle(articleId)`), because Prisma will do the same thing with `onDelete` rules later.',
      acceptance: ['All three cascades verified by hand or with an extra test'],
    },
    {
      id: 'w10-kh-cross-cutting',
      kind: 'code',
      title: 'Logging middleware & response interceptor',
      summary: 'Cross-cutting concerns outside the controllers.',
      estimateH: 1,
      projectId: KH_PROJECT,
      description:
        'Add a `LoggerMiddleware` that logs `METHOD url status durationMs` (listen to `res.on("finish")`). If you haven\'t already, move the password stripping into a global interceptor so no controller can forget it.',
      acceptance: ['Every request is logged once', 'Controllers contain no logging or serialization code'],
    },
    {
      id: 'w10-kh-swagger',
      kind: 'code',
      title: 'Swagger at /doc',
      summary: 'Documented DTOs, params and responses.',
      estimateH: 1,
      projectId: KH_PROJECT,
      points: 16,
      description:
        '`SwaggerModule.setup("doc", app, document)`. Annotate the DTOs (or enable the CLI plugin in `nest-cli.json`) and add `@ApiTags`, `@ApiResponse` for the error codes, and `@ApiQuery` for the filters.',
      run: 'open http://localhost:4000/doc',
      acceptance: ['Every endpoint is visible and can be called with "Try it out"', 'Enums show up as dropdowns'],
    },
    {
      id: 'w10-kh-pagination',
      kind: 'code',
      title: 'Hacker scope: pagination & sorting',
      summary: '?page&limit → { total, page, limit, data }, ?sortBy&order.',
      estimateH: 1.5,
      projectId: KH_PROJECT,
      points: 20,
      description:
        'Add a shared `PaginationQueryDto` (`page ≥ 1`, `1 ≤ limit ≤ 100`, `sortBy` from a whitelist, `order` `asc|desc`). **Only when** `page`/`limit` are passed, wrap the result as `{ total, page, limit, data }`. Otherwise keep returning a plain array, so the provided tests still pass.',
      acceptance: ['Backwards compatible without query params', '`sortBy` is whitelisted (no sorting by `password`!)'],
    },
    {
      id: 'w10-kh-lint-tests',
      kind: 'code',
      title: 'All provided tests green, zero lint errors',
      summary: 'Each passing test is +10. Each lint error is −10.',
      estimateH: 1,
      projectId: KH_PROJECT,
      description:
        'Run the full integration suite and `npm run lint` until both are clean. **Never edit the provided tests (−670).** Add extra tests of your own for the hacker-scope features in a separate file.',
      run: 'npm run lint\nnpm run test',
      acceptance: [
        '0 failing tests',
        '0 lint errors',
        "The template's test files are unchanged (`git diff main -- test/`)",
      ],
    },
    {
      id: 'w10-kh-ship',
      kind: 'code',
      title: 'Ship & self-score: Knowledge Hub API',
      summary: 'README, PR, score.',
      estimateH: 0.5,
      projectId: KH_PROJECT,
      description:
        'Write a README (how to run, `/doc` link, how to run the tests) and open the PR with your self-score. Merge it after review, because the next assignments build on `main`.',
      acceptance: ['Self-score written down', 'PR merged into `main`'],
    },
  ],
};
