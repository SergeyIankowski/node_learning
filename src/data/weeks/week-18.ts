import { programModule } from '../links';
import type { Week } from '../types';
import { AI_PROJECT } from './week-17';

export const week18: Week = {
  id: 'w18',
  number: 18,
  programWeek: 9,
  title: 'AI hardening: rate limits, caching, usage & resilience',
  short: 'AI hardening',
  goals: [
    'Protect a paid or quota-limited upstream with rate limiting and caching',
    'Retry with exponential backoff and map upstream failures to the right HTTP statuses',
    'Track usage and basic AI observability',
  ],
  modules: [programModule('ai-llm-integration', 'Knowledge Hub.AI: LLM Integration')],
  tasks: [
    {
      id: 'w18-resilience-read',
      kind: 'read',
      title: 'Retries, backoff, rate limiting, caching',
      summary: 'Patterns for calling unreliable third-party APIs.',
      estimateH: 1.5,
      resources: [
        {
          title: 'AWS: Exponential backoff and jitter',
          url: 'https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/',
        },
        { title: 'MDN: 429 Too Many Requests', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429' },
        {
          title: 'MDN: Retry-After header',
          url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After',
        },
        { title: 'Nest: caching', url: 'https://docs.nestjs.com/techniques/caching' },
        { title: 'Token bucket algorithm', url: 'https://en.wikipedia.org/wiki/Token_bucket' },
      ],
      questions: [
        'Why add jitter to backoff?',
        'Fixed window vs sliding window vs token bucket rate limiting?',
        "Why must the cache key include the article's `updatedAt`?",
        'Which errors are worth retrying, and which are not (4xx vs 429 vs 5xx vs timeout)?',
      ],
    },
    {
      id: 'w18-rate-limit',
      kind: 'code',
      title: 'Rate limiting for /ai/* (429 + Retry-After)',
      summary: 'AI_RATE_LIMIT_RPM requests per minute.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 16,
      description:
        'Use a guard on the AI controller, either `@nestjs/throttler` with a named throttler configured from `AI_RATE_LIMIT_RPM`, or your own sliding-window limiter per user or IP. When the limit is exceeded, return **429** with a `Retry-After` header in seconds.',
      run: 'for i in $(seq 25); do curl -s -o /dev/null -w "%{http_code} " -X POST localhost:4000/ai/articles/$ID/summarize -H "Authorization: Bearer $TOKEN"; done',
      expected: '200 200 … 200 429 429 429 429 429',
      acceptance: ['Request 21 in a minute → 429', '`Retry-After` is present and correct'],
    },
    {
      id: 'w18-cache',
      kind: 'code',
      title: 'Response cache for summarize/translate',
      summary: 'Deterministic key + TTL.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 10,
      description:
        'Key: `${endpoint}:${articleId}:${updatedAt}:${stableStringify(params)}`. Store it in a `Map` with `expiresAt` (or use `@nestjs/cache-manager`) with TTL `AI_CACHE_TTL_SEC`. Updating the article changes `updatedAt`, so the cache entry is skipped automatically.',
      acceptance: [
        'The second identical call is instant and makes no Gemini call (log it)',
        'Editing the article produces a fresh summary',
        'Entries expire after the TTL',
      ],
    },
    {
      id: 'w18-usage',
      kind: 'code',
      title: 'Usage tracking endpoint',
      summary: 'GET /ai/usage: totals, by endpoint, tokens.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 16,
      description:
        '`AiUsageService` counts `{ totalRequests, byEndpoint: { summarize, translate, analyze, generate }, tokens: { prompt, candidates, total } }` since startup, using `usageMetadata` from Gemini responses. Expose `GET /ai/usage` (admin only is a sensible choice).',
      acceptance: ['Counters increase as expected', 'Cache hits are counted separately from upstream calls'],
    },
    {
      id: 'w18-errors-backoff',
      kind: 'code',
      title: 'Error mapping + exponential backoff',
      summary: 'timeout → 503, auth → 500, upstream 429 → retry.',
      estimateH: 1.5,
      projectId: AI_PROJECT,
      points: 10,
      description:
        'In `GeminiService`: on an upstream 429 or 5xx, retry up to 3 times with `delay = base * 2 ** attempt + random jitter` (respect upstream `Retry-After` if present). Map the final `GeminiError` kinds: timeout or network → `503 "AI service temporarily unavailable"`, auth → `500` (generic message, no key), rate_limit after retries → 503. Test each with a mocked `fetch`.',
      acceptance: [
        'Unit tests cover each error kind',
        'A temporarily wrong key gives a 500 with no secret in the body or logs',
      ],
    },
    {
      id: 'w18-generate',
      kind: 'code',
      title: 'POST /ai/generate + conversation context',
      summary: 'Optional generic endpoint with session memory (hacker scope).',
      estimateH: 1.5,
      projectId: AI_PROJECT,
      points: 20,
      description:
        '`POST /ai/generate { prompt, sessionId? }` → `{ text, sessionId }`. Keep the last N turns for each `sessionId` in memory and send them as `contents` history. Apply the same rate limit. Expire idle sessions.',
      acceptance: [
        'A follow-up question ("and in Russian?") uses the previous turn',
        'Rate-limited like the other routes',
      ],
    },
    {
      id: 'w18-observability',
      kind: 'code',
      title: 'Hacker scope: AI observability',
      summary: 'Latency, cache hit ratio, diagnostics.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 10,
      description:
        'Extend `/ai/usage` (or add `/ai/diagnostics`) with p50/p95 upstream latency (keep the last 100 samples), cache hit ratio, retries count, last error kind and time, and the configured model.',
      acceptance: ['Numbers change as you make requests', 'No secrets in the output'],
    },
    {
      id: 'w18-ai-readme-ship',
      kind: 'code',
      title: 'README + ship & self-score: AI',
      summary: 'The mandatory README section, then the PR.',
      estimateH: 1,
      projectId: AI_PROJECT,
      description:
        'Write the README section: getting a Gemini key step by step, the model used, setup after clone (`.env` keys, where the API key goes, run, sample curl for each endpoint), and known limitations (free-tier quotas, latency, regional availability). Open the PR with your self-score.',
      acceptance: ['A classmate could set it up from the README alone', 'Self-score written down'],
    },
  ],
};
