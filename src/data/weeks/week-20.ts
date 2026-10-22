import { programModule } from '../links';
import type { Week } from '../types';
import { RAG_PROJECT } from './week-19';

export const week20: Week = {
  id: 'w20',
  number: 20,
  programWeek: 10,
  title: 'RAG chat, consistency & the finish line',
  short: 'RAG chat & finish',
  goals: [
    'Build grounded prompts with correct source attribution',
    'Keep conversation memory and a consistent index',
    'Handle outages gracefully',
    'Finish the course and prepare for interviews',
  ],
  modules: [programModule('ai-rag-vectordb', 'Knowledge Hub.AI: RAG & Vector DB')],
  tasks: [
    {
      id: 'w20-retrieval-read',
      kind: 'read',
      title: 'Better retrieval: hybrid search and re-ranking',
      summary: 'Optional techniques for the hacker scope.',
      estimateH: 1.5,
      resources: [
        { title: 'Qdrant: hybrid queries', url: 'https://qdrant.tech/documentation/concepts/hybrid-queries/' },
        { title: 'Reciprocal rank fusion (paper)', url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf' },
        { title: 'PostgreSQL full-text search', url: 'https://www.postgresql.org/docs/current/textsearch-intro.html' },
      ],
      questions: [
        'How does reciprocal rank fusion merge two ranked lists?',
        'When does lexical search beat embeddings (exact names, codes, ids)?',
        "What does a re-ranker look at that vector similarity doesn't?",
      ],
    },
    {
      id: 'w20-chat',
      kind: 'code',
      title: 'POST /ai/rag/chat: grounded answer + sources',
      summary: 'Retrieve, then build the prompt, then generate, then attribute.',
      estimateH: 2.5,
      projectId: RAG_PROJECT,
      points: 26,
      description: `1. Retrieve the top-k chunks for the question (reuse the search service)
2. Build the prompt: a system message ("answer ONLY from the provided context; if it isn't there, say you don't know; cite sources as [1], [2]"), then the numbered context chunks, then the conversation history, then the question
3. Generate with Gemini
4. \`sources\` = **exactly the chunks passed to generation** (\`{ articleId, articleTitle, relevantChunk }\`)
5. Return \`conversationId\` (generate a uuid when it is missing)`,
      run: 'curl -s -X POST localhost:4000/ai/rag/chat -H "Authorization: Bearer $TOKEN" -H "content-type: application/json" -d \'{"question":"What does the knowledge hub say about Docker multi-stage builds?"}\'',
      acceptance: [
        'The answer cites the article content',
        'A question with no matching content → "I don\'t know"-style answer, not a hallucination',
        'A missing `question` → 400',
      ],
    },
    {
      id: 'w20-memory',
      kind: 'code',
      title: 'Conversation memory + history endpoint',
      summary: 'Last N messages per conversationId.',
      estimateH: 1,
      projectId: RAG_PROJECT,
      points: 10,
      description:
        'A `ConversationStore` (an in-memory `Map`, or a Prisma table if you want persistence) appends `{ role, content, at }` and trims to `RAG_CONVERSATION_MAX_MESSAGES`. Include the history in the prompt. Also use the history to rewrite follow-up questions before retrieval ("what about its downsides?" → a standalone question). Add `GET /ai/rag/chat/:conversationId/history`.',
      acceptance: [
        'Follow-up questions work',
        'History never exceeds the max',
        'Unknown conversation → 404 on the history endpoint',
      ],
    },
    {
      id: 'w20-consistency',
      kind: 'code',
      title: 'Reindex consistency: no stale vectors',
      summary: 'Updates and deletes always reflect in search.',
      estimateH: 1,
      projectId: RAG_PROJECT,
      points: 10,
      description:
        'Make sure the following holds: an article update → reindex that article (delete its old points, then upsert). Article delete → delete its points. Status changed to non-published → removed from the default index. Write a quick script or e2e test: edit an article to remove a phrase, reindex, and check search no longer returns the old chunk.',
      acceptance: ['The scenario above passes', 'Chunk ids are deterministic, so repeated indexing is idempotent'],
    },
    {
      id: 'w20-outages',
      kind: 'code',
      title: 'Outage handling: 503 + logs',
      summary: 'Stop Qdrant, break the key, and check the behavior.',
      estimateH: 1,
      projectId: RAG_PROJECT,
      points: 10,
      description:
        'Catch connection errors from the vector store and map them to `503 "Vector database unavailable"`. Gemini failures map to 503 through the error mapping from week 18. Log the error kind and endpoint, never the key or full URLs with credentials.',
      run: 'docker compose stop vectordb\ncurl -i -X POST localhost:4000/ai/rag/search … \ndocker compose start vectordb',
      expected: 'HTTP/1.1 503 Service Unavailable\n{"statusCode":503,"message":"Vector database unavailable"}',
      acceptance: ['503 for both outage types', 'The app recovers by itself when the service is back'],
    },
    {
      id: 'w20-hacker',
      kind: 'code',
      title: 'Hacker scope: hybrid retrieval, re-ranking, incremental indexing',
      summary: 'Pick at least one. Each is worth +10.',
      estimateH: 3,
      projectId: RAG_PROJECT,
      points: 30,
      description: `- **Hybrid**: run Postgres full-text search (\`to_tsvector\` / \`plainto_tsquery\` via \`$queryRaw\`) or Qdrant sparse vectors next to the dense search, and merge with reciprocal rank fusion
- **Re-ranking**: take the top 20, ask Gemini to score each chunk's relevance 0–10 for the question (structured output), and keep the top 5
- **Incremental indexing**: store \`indexedAt\` / a content hash for each article. \`POST /ai/rag/index\` only processes articles whose \`updatedAt > indexedAt\`, and running it twice does nothing the second time`,
      acceptance: ['Each implemented technique is documented in the README with a before/after example'],
    },
    {
      id: 'w20-rag-ship',
      kind: 'code',
      title: 'README + ship & self-score: RAG',
      summary: 'The full startup flow from a fresh clone.',
      estimateH: 1,
      projectId: RAG_PROJECT,
      description:
        'README: Gemini key steps, generation and embedding models, vector DB choice and how to run it, the full flow (env → `docker compose up --build` → `POST /ai/rag/index` → sample search and chat requests), and limitations (quotas, latency, indexing time, regions). Test it from a fresh clone, then open the PR with your self-score.',
      acceptance: ['Works from a fresh clone by following the README', 'Self-score written down'],
    },
    {
      id: 'w20-interview-read',
      kind: 'read',
      title: 'Bonus: Node.js & NestJS interview preparation',
      summary: 'Review everything you built against common interview topics.',
      estimateH: 4,
      resources: [
        {
          title: 'RS School: Node.js interview topics',
          url: 'https://github.com/rolling-scopes-school/tasks/blob/master/node/modules/interview/README.MD',
        },
        { title: 'Node.js best practices (goldbergyoni)', url: 'https://github.com/goldbergyoni/nodebestpractices' },
        { title: 'Nest: microservices overview', url: 'https://docs.nestjs.com/microservices/basics' },
        { title: 'Nest: GraphQL quick start', url: 'https://docs.nestjs.com/graphql/quick-start' },
      ],
      questions: [
        'Explain the event loop, libuv thread pool and when to use worker threads, using an example from your own projects.',
        'Walk through the Nest request lifecycle and where you used each building block in the Knowledge Hub.',
        'How did you secure the API (bcrypt, JWT, RBAC, rate limiting, CORS, OWASP)?',
        'How would you scale the Knowledge Hub (cluster, containers, caching, DB indexes, a queue for indexing)?',
        'How did you test it, and how did you reach the coverage thresholds?',
        'Explain your RAG pipeline end to end, and how you prevent stale or hallucinated answers.',
      ],
    },
  ],
};
