import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';
import { KH_REPO_NOTE } from './week-09';

export const RAG_PROJECT = 'w19-rag';

export const week19: Week = {
  id: 'w19',
  number: 19,
  programWeek: 10,
  title: 'RAG foundations: embeddings, chunking & a vector DB',
  short: 'Embeddings & vectors',
  goals: [
    'Explain RAG: why retrieval grounds answers and reduces hallucinations',
    'Generate embeddings and run similarity search',
    'Run Qdrant in Compose and build an index from Knowledge Hub articles',
  ],
  modules: [programModule('ai-rag-vectordb', 'Knowledge Hub.AI: RAG & Vector DB')],
  tasks: [
    {
      id: 'w19-rag-read',
      kind: 'read',
      title: 'RAG, embeddings and vector databases',
      summary: 'The theory behind semantic search and grounded generation.',
      estimateH: 3,
      resources: [
        { title: 'What is RAG? (AWS)', url: 'https://aws.amazon.com/what-is/retrieval-augmented-generation/' },
        { title: 'Gemini API: embeddings', url: 'https://ai.google.dev/gemini-api/docs/embeddings' },
        { title: 'Qdrant: overview', url: 'https://qdrant.tech/documentation/overview/' },
        { title: 'Qdrant: quickstart', url: 'https://qdrant.tech/documentation/quickstart/' },
        { title: 'Qdrant: payload filtering', url: 'https://qdrant.tech/documentation/concepts/filtering/' },
        { title: 'Chroma docs (alternative)', url: 'https://docs.trychroma.com/' },
      ],
      questions: [
        'What is an embedding? Why does cosine similarity measure "meaning closeness"?',
        'Why chunk documents? What do chunk size and overlap trade off?',
        'What is the embedding `taskType` (RETRIEVAL_DOCUMENT vs RETRIEVAL_QUERY), and why does it matter?',
        'Why store metadata (articleId, title, status, tags) next to the vectors?',
        'Which vector DB distance metric matches your embedding model?',
      ],
    },
    {
      id: 'w19-cosine',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: semantic search in 40 lines',
      summary: 'Embed 6 sentences, search them with cosine similarity in plain JS.',
      estimateH: 1,
      description: `Write \`search.mjs\`:
1. Six sentences on 3 topics (for example Node streams, cooking, football)
2. Embed them with the Gemini embedding endpoint (\`embedContent\` / \`batchEmbedContents\`)
3. Embed the query "how do I process a big file without loading it into memory?"
4. \`cosine(a, b) = dot(a, b) / (|a| · |b|)\`. Print the sentences ranked by score

No vector DB yet: this is what one does for you, at scale.`,
      run: 'node --env-file=.env search.mjs',
      expected:
        '0.81  Streams let you process data chunk by chunk…\n0.74  Use pipeline() to connect a readable file stream…\n0.32  …',
      acceptance: [
        'The Node-related sentences rank highest',
        'You can explain why lexical search would miss some of them',
      ],
    },
    {
      id: RAG_PROJECT,
      kind: 'project',
      title: 'Project: Knowledge Hub RAG & Vector DB',
      summary: 'Index articles into Qdrant, semantic search with filters, RAG chat with sources and memory.',
      estimateH: 1,
      ...assignment('10-ai-rag-vectordb'),
      overview: `${KH_REPO_NOTE} It also builds on the AI module from weeks 17–18.

Add a **RAG layer** that answers questions using Knowledge Hub articles: chunk → embed (Gemini) → store in an **external vector DB in Docker** → retrieve → grounded generation **with source attribution**.

This plan splits it over **weeks 19–20**. Week 19 covers Qdrant, the chunker, indexing, delete and search. Week 20 covers chat, memory, consistency, outages, hacker scope and the README.`,
      requirements: [
        'TypeScript; Nest.js in the same repo; Node.js 24.x (24.10.0+)',
        'Gemini for generation **and** embeddings (free tier)',
        'External vector DB (Qdrant or Chroma) in the **same Docker Compose** as app + PostgreSQL',
        'Keep RAG in a dedicated `RagModule`',
        ...PR_RULES,
      ],
      spec: `### Flow
1. Extract content (published articles by default) → 2. chunk → 3. embed → 4. store vectors + metadata → 5. on a question: embed the query, retrieve the top chunks, build a grounded prompt, generate → 6. return the answer + sources

### Endpoints
| Route | Body | Response |
|---|---|---|
| \`POST /ai/rag/index\` | \`{ onlyPublished? = true, articleIds?: string[] }\` | 200 \`{ indexedArticles, indexedChunks, vectorCollection }\` |
| \`POST /ai/rag/search\` | \`{ query (required), limit? = 5 (≤ 20), articleStatus?, categoryId?, tags? }\` | 200 \`{ results: [{ articleId, articleTitle, chunk, similarity }] }\` · 400 no query |
| \`POST /ai/rag/chat\` | \`{ question (required), conversationId? }\` | 200 \`{ answer, sources: [{ articleId, articleTitle, relevantChunk }], conversationId }\` · 400 |
| \`DELETE /ai/rag/index/articles/:articleId\` | — | 204 removed · 404 nothing indexed |
| \`GET /ai/rag/chat/:conversationId/history\` (optional) | — | conversation messages |

### Requirements
- Vector DB in its own container, with a persistent volume, healthcheck and restart policy. The app \`depends_on\` it being healthy
- Metadata: \`articleId\`, \`title\`, plus status, category and tags for filtering
- Chunking: \`RAG_CHUNK_SIZE\` (800), \`RAG_CHUNK_OVERLAP\` (200), deterministic and stable across reindexes
- Memory: the last \`RAG_CONVERSATION_MAX_MESSAGES\` (20) per \`conversationId\`
- Vector DB down → **503**. Gemini down → **503**. Log integration errors without credentials

### .env.example
~~~
GEMINI_API_KEY=…
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-2.0-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
RAG_VECTOR_DB_PROVIDER=qdrant
RAG_VECTOR_DB_URL=http://vectordb:6333
RAG_VECTOR_COLLECTION=knowledge_hub_articles
RAG_CHUNK_SIZE=800
RAG_CHUNK_OVERLAP=200
RAG_CONVERSATION_MAX_MESSAGES=20
~~~

### README must include
How to get a Gemini key · the generation and embedding models · which vector DB and how to run it · the full startup flow (env → compose → build the index → sample RAG requests) · known limitations`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+20** index · **+16** search with attribution · **+26** chat end-to-end with sources',
            '**+10** delete from index · **+16** Gemini generation + embeddings via .env · **+16** chunking via env',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+20** external vector DB in Compose (healthy, connected)',
            '**+10** metadata filtering',
            '**+10** conversation memory with max size',
            '**+10** no stale vectors after updates/deletes',
            '**+10** 503 + logs on outages',
          ],
        },
        {
          scope: 'Hacker',
          items: [
            '**+10** hybrid retrieval (semantic + lexical) with merged ranking',
            '**+10** secondary re-ranking',
            '**+10** incremental, idempotent indexing',
          ],
        },
        { scope: 'Forfeits', items: PR_FORFEITS },
      ],
      deliverables: [
        'RagModule, vector store adapter, compose service',
        'README with the full RAG flow',
        'PR with self-score',
      ],
    },
    {
      id: 'w19-qdrant-compose',
      kind: 'code',
      title: 'Qdrant service in Docker Compose',
      summary: 'Volume, healthcheck, restart, app depends on it.',
      estimateH: 1,
      projectId: RAG_PROJECT,
      points: 20,
      description: `~~~yaml
vectordb:
  image: qdrant/qdrant:latest   # pin a version
  volumes: [qdrant_data:/qdrant/storage]
  ports: ["6333:6333"]
  restart: unless-stopped
  networks: [kh-net]
  healthcheck:
    test: ["CMD-SHELL", "bash -c ':> /dev/tcp/127.0.0.1/6333' || exit 1"]
    interval: 10s
    retries: 5
~~~
Add \`vectordb: condition: service_healthy\` to \`app.depends_on\`. The Qdrant image has no curl, hence the bash TCP check. Open the dashboard at http://localhost:6333/dashboard.`,
      run: 'docker compose up -d --build && docker compose ps',
      acceptance: ['`vectordb` is healthy', 'The app reaches it at `http://vectordb:6333`', 'Data survives a restart'],
    },
    {
      id: 'w19-chunker',
      kind: 'code',
      title: 'Deterministic chunker',
      summary: 'Size + overlap from env, stable output, unit-tested.',
      estimateH: 1.5,
      projectId: RAG_PROJECT,
      points: 16,
      description:
        'Write the pure function `chunk(text, size, overlap): string[]`. Prefer splitting on paragraph or sentence boundaries, and fall back to a hard split. The same input always gives the same chunks. Give each chunk a **deterministic id**, for example a uuid v5 or a hash of `articleId:index`. That makes re-indexing an upsert instead of creating duplicates.',
      acceptance: [
        'Unit tests: sizes ≤ size, overlap respected, deterministic, empty text → []',
        'Values read from `RAG_CHUNK_SIZE` / `RAG_CHUNK_OVERLAP`',
      ],
    },
    {
      id: 'w19-index',
      kind: 'code',
      title: 'Embeddings + POST /ai/rag/index',
      summary: 'Articles → chunks → embeddings → upsert into the collection.',
      estimateH: 2.5,
      projectId: RAG_PROJECT,
      points: 36,
      description: `- \`EmbeddingService.embed(texts, taskType)\` uses \`batchEmbedContents\` with \`GEMINI_EMBEDDING_MODEL\`. Batch the inputs and respect rate limits
- \`VectorStore\` interface (\`ensureCollection\`, \`upsert\`, \`search\`, \`deleteByArticle\`) with a \`QdrantVectorStore\` built on \`fetch\` or \`@qdrant/js-client-rest\`
- Create the collection with the right vector size (take it from the first embedding) and **Cosine** distance
- Payload: \`{ articleId, articleTitle, chunk, chunkIndex, status, categoryId, tags, updatedAt }\`
- Before upserting an article, **delete its old points**, so a shorter article leaves no stale chunks`,
      run: 'curl -s -X POST localhost:4000/ai/rag/index -H "Authorization: Bearer $TOKEN" -H "content-type: application/json" -d \'{}\'',
      expected: '{"indexedArticles":5,"indexedChunks":23,"vectorCollection":"knowledge_hub_articles"}',
      acceptance: [
        'Points visible in the Qdrant dashboard with payloads',
        'Re-indexing twice gives the same point count',
        '`articleIds` limits the indexing',
      ],
      hints: [
        'If `text-embedding-004` is no longer available, use the current embedding model from the Gemini models page and set `GEMINI_EMBEDDING_MODEL`.',
      ],
    },
    {
      id: 'w19-delete-index',
      kind: 'code',
      title: 'DELETE /ai/rag/index/articles/:articleId',
      summary: '204 or 404.',
      estimateH: 0.5,
      projectId: RAG_PROJECT,
      points: 10,
      description:
        'Count the points with a filter `articleId = :id`. Zero → 404. Otherwise delete them by filter → 204. Also call it from the article delete flow, so deleted articles disappear from search.',
      acceptance: ['204 then 404 on a repeat', 'Deleting an article via `/article/:id` removes its vectors'],
    },
    {
      id: 'w19-search',
      kind: 'code',
      title: 'POST /ai/rag/search with metadata filters',
      summary: 'Ranked chunks with attribution, filtered by status, category and tags.',
      estimateH: 1.5,
      projectId: RAG_PROJECT,
      points: 26,
      description:
        'Embed the query with `taskType: RETRIEVAL_QUERY`, then run a Qdrant search with `limit` (default 5, max 20 via DTO validation) and a `filter.must` built from `articleStatus`, `categoryId` and `tags` (`match: { any: tags }`). Map each hit to `{ articleId, articleTitle, chunk, similarity: score }`.',
      run: 'curl -s -X POST localhost:4000/ai/rag/search -H "Authorization: Bearer $TOKEN" -H "content-type: application/json" -d \'{"query":"how to handle errors in streams","limit":3}\'',
      acceptance: [
        'Results are relevant and sorted by similarity',
        'Each filter narrows the results',
        'A missing query → 400',
      ],
    },
  ],
};
