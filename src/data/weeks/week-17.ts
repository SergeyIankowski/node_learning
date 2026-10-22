import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

export const AI_PROJECT = 'w17-ai';

export const week17: Week = {
  id: 'w17',
  number: 17,
  programWeek: 9,
  title: 'LLM integration: Gemini API in a Nest service',
  short: 'LLM integration',
  goals: [
    'Call an LLM over HTTP and understand requests, responses, tokens and quotas',
    'Keep prompts in templates and get structured JSON output',
    'Expose summarize, translate and analyze endpoints over real article data',
  ],
  modules: [programModule('ai-llm-integration', 'Knowledge Hub.AI: LLM Integration')],
  tasks: [
    {
      id: 'w17-llm-read',
      kind: 'read',
      title: 'Gemini API, prompt design, Nest HTTP',
      summary: 'Everything needed to call an LLM from a backend.',
      estimateH: 3,
      resources: [
        { title: 'Gemini API docs', url: 'https://ai.google.dev/gemini-api/docs' },
        { title: 'Get a Gemini API key', url: 'https://ai.google.dev/gemini-api/docs/api-key' },
        { title: 'Gemini models (check current names)', url: 'https://ai.google.dev/gemini-api/docs/models' },
        {
          title: 'Gemini: structured output (JSON schema)',
          url: 'https://ai.google.dev/gemini-api/docs/structured-output',
        },
        { title: 'Gemini: rate limits', url: 'https://ai.google.dev/gemini-api/docs/rate-limits' },
        { title: 'Prompt engineering guide', url: 'https://platform.openai.com/docs/guides/prompt-engineering' },
        { title: 'Nest: HTTP module', url: 'https://docs.nestjs.com/techniques/http-module' },
      ],
      questions: [
        'What does a `generateContent` request look like (`contents`, `parts`, `systemInstruction`, `generationConfig`)?',
        'What are tokens, and how do they relate to quotas and latency?',
        'How do you make a model return JSON that matches a schema (`responseMimeType` + `responseSchema`)?',
        'Why keep prompts in templates instead of building them in controllers?',
        'Where must the API key live, and what must never be logged?',
      ],
    },
    {
      id: 'w17-gemini-fetch',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: raw fetch to Gemini',
      summary: 'One script, no SDK, so you see the raw HTTP contract.',
      estimateH: 0.5,
      description: `Get a free API key in Google AI Studio. Write \`gemini.mjs\`:
~~~js
const url = \`\${process.env.GEMINI_API_BASE_URL}/v1beta/models/\${process.env.GEMINI_MODEL}:generateContent\`;
const res = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
  body: JSON.stringify({ contents: [{ parts: [{ text: 'Explain the Node.js event loop in 2 sentences.' }] }] }),
});
const json = await res.json();
console.log(json.candidates?.[0]?.content?.parts?.[0]?.text, json.usageMetadata);
~~~
Then ask for JSON with \`generationConfig: { responseMimeType: 'application/json', responseSchema: … }\`.`,
      run: 'node --env-file=.env gemini.mjs',
      acceptance: [
        'You get text and `usageMetadata` back',
        'A wrong key gives a 400/403, and you looked at the error body',
        'Structured JSON output parses with `JSON.parse`',
      ],
      hints: [
        'If the model name from the assignment (`gemini-2.0-flash`) has been retired, pick a current flash model from the models page and put it in `GEMINI_MODEL`.',
      ],
    },
    {
      id: AI_PROJECT,
      kind: 'project',
      title: 'Project: Knowledge Hub AI (LLM integration)',
      summary:
        'Summarize, translate and analyze articles with Gemini, with rate limiting, caching, usage tracking and resilient errors.',
      estimateH: 1,
      ...assignment('09-ai-llm-integration'),
      overview: `${KH_REPO_NOTE}

Integrate the **Google Gemini API** (free tier) over HTTP and expose AI endpoints that work on **real articles from the database**.

This plan splits it over **weeks 17–18**. Week 17 covers the module, prompts and the 3 article endpoints. Week 18 covers rate limiting, caching, usage, resilience, the generic endpoint and the README.`,
      requirements: [
        'TypeScript; Nest.js in the same repo; Node.js 24.x (24.10.0+)',
        'Google Gemini API with an API key (free tier), called over **HTTP**',
        'API keys and sensitive headers are never logged',
        ...PR_RULES,
      ],
      spec: `### Endpoints
| Route | Body | Response |
|---|---|---|
| \`POST /ai/articles/:articleId/summarize\` | \`{ maxLength?: 'short'\\|'medium'\\|'detailed' }\` (default medium) | \`{ articleId, summary, originalLength, summaryLength }\` |
| \`POST /ai/articles/:articleId/translate\` | \`{ targetLanguage (required), sourceLanguage? }\` | \`{ articleId, translatedText, detectedLanguage }\` |
| \`POST /ai/articles/:articleId/analyze\` | \`{ task?: 'review'\\|'bugs'\\|'optimize'\\|'explain' }\` (default review) | \`{ articleId, analysis, suggestions: string[], severity: 'info'\\|'warning'\\|'error' }\` |
| \`POST /ai/generate\` (optional) | free-form prompt | rate-limited like the others |

Statuses: 200 OK · 400 validation (for example a missing \`targetLanguage\`) · 404 article not found.

### Cross-cutting
1. **Integration module**: \`AiModule\` + \`GeminiService\`
2. **Prompt templates** in a dedicated module or directory
3. **Validation**: DTOs + pipes for bodies and params
4. **Rate limiting**: \`AI_RATE_LIMIT_RPM\` (default 20) → **429** + \`Retry-After\`
5. **Caching** (summarize/translate): in-memory, key = articleId + params + article \`updatedAt\`, TTL \`AI_CACHE_TTL_SEC\` (300)
6. **Usage tracking** since startup: total requests, by endpoint, and token usage if available, exposed through an endpoint
7. **Errors**: timeout or network → **503**; bad key or auth → **500** (no secrets in the message); upstream 429 → exponential backoff (≤ 3 retries) or 503
8. Reuse the existing logging and error-handling standards

### .env.example
~~~
GEMINI_API_KEY=your-gemini-api-key
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.0-flash
AI_RATE_LIMIT_RPM=20
AI_CACHE_TTL_SEC=300
~~~

### README must include
How to get a key (step by step) · which model is used · setup after clone (env, where the key goes, how to run and test the AI endpoints) · known limitations (quotas, latency, regions)`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+20** summarize · **+16** translate · **+16** analyze (structured)',
            '**+16** Gemini integration (key via .env, configurable model)',
            '**+10** prompt templates in a dedicated module',
            '**+16** validation (400/404)',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+16** rate limiting (429 + Retry-After)',
            '**+16** usage tracking endpoint',
            '**+10** graceful Gemini error handling',
            '**+10** response caching',
            '**+10** `/ai/generate`',
          ],
        },
        {
          scope: 'Hacker',
          items: [
            '**+10** schema-validated AI output with a safe fallback',
            '**+10** observability (latency, cache hit ratio, diagnostics)',
            '**+10** conversation context for `/ai/generate`',
          ],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: ['AiModule with GeminiService, prompts, DTOs', 'README section for AI setup', 'PR with self-score'],
    },
    {
      id: 'w17-ai-module',
      kind: 'code',
      title: 'AiModule + GeminiService',
      summary: 'A single integration point with config, timeout and typed results.',
      estimateH: 2,
      projectId: AI_PROJECT,
      points: 16,
      description:
        '`GeminiService.generate({ prompt, system?, schema? })` reads `GEMINI_*` from `ConfigService`, calls `fetch` with `AbortSignal.timeout(15_000)`, sends the key in the `x-goog-api-key` header (never in a URL you log), and returns `{ text, usage }`. Errors are wrapped in a typed `GeminiError` (`kind: "timeout" | "auth" | "rate_limit" | "upstream"`), which the next week maps to HTTP statuses.',
      acceptance: [
        'The model and base URL are configurable',
        'No API key in any log line (`grep` the logs)',
        'Error kinds are distinguished',
      ],
    },
    {
      id: 'w17-ai-prompts',
      kind: 'code',
      title: 'Prompt templates module',
      summary: 'Versioned, testable prompt builders.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 10,
      description:
        'Create `src/ai/prompts/` with pure functions: `summarizePrompt(article, maxLength)`, `translatePrompt(article, target, source?)` and `analyzePrompt(article, task)`. Each returns `{ system, user, schema? }`. Delimit the article content clearly (for example inside `<article>…</article>`) and tell the model to treat it as data. This is a simple prompt-injection mitigation.',
      acceptance: ['No prompt strings in controllers or services', 'A unit test snapshots each prompt'],
    },
    {
      id: 'w17-ai-summarize',
      kind: 'code',
      title: 'POST /ai/articles/:id/summarize',
      summary: 'Summary with length presets.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 20,
      description:
        'Load the article (404 if missing), build the prompt, call Gemini, and return `{ articleId, summary, originalLength: content.length, summaryLength: summary.length }`. `maxLength` maps to concrete guidance (for example short = 1–2 sentences, medium = 1 paragraph, detailed = 3–5 bullet points).',
      run: 'curl -s -X POST localhost:4000/ai/articles/$ID/summarize -H "Authorization: Bearer $TOKEN" -H "content-type: application/json" -d \'{"maxLength":"short"}\'',
      acceptance: ['Works on seeded articles', 'Unknown id → 404', 'Invalid `maxLength` → 400'],
    },
    {
      id: 'w17-ai-translate',
      kind: 'code',
      title: 'POST /ai/articles/:id/translate',
      summary: 'Translation + detected source language.',
      estimateH: 1,
      projectId: AI_PROJECT,
      points: 16,
      description:
        'Ask for JSON `{ translatedText, detectedLanguage }` through structured output. `targetLanguage` is required (400 without it). Pass `sourceLanguage` as a hint when given.',
      acceptance: ['400 without `targetLanguage`', '`detectedLanguage` is filled in'],
    },
    {
      id: 'w17-ai-analyze',
      kind: 'code',
      title: 'POST /ai/articles/:id/analyze (structured)',
      summary: 'analysis + suggestions[] + severity enum via a JSON schema.',
      estimateH: 1.5,
      projectId: AI_PROJECT,
      points: 16,
      description:
        'Use `responseSchema` with `severity` as an enum. Then **validate the model output yourself** (zod or class-validator) before returning it. On invalid output, retry once, then fall back to `{ analysis: text, suggestions: [], severity: "info" }`. That fallback is the hacker-scope item "schema-validated output".',
      acceptance: ['The response always matches the interface', 'Each `task` value changes the prompt'],
    },
    {
      id: 'w17-ai-validation',
      kind: 'code',
      title: 'Validation for all AI routes',
      summary: 'DTOs + ParseUUIDPipe, correct 400/404.',
      estimateH: 0.5,
      projectId: AI_PROJECT,
      points: 16,
      description:
        'Add `SummarizeDto`, `TranslateDto` and `AnalyzeDto` with `@IsIn` / `@IsOptional` / `@IsString() @IsNotEmpty()`, and `ParseUUIDPipe` for `articleId`. Document them in Swagger.',
      acceptance: ['Bad bodies → 400 with messages', 'Bad uuid → 400', 'Visible in `/doc`'],
    },
  ],
};
