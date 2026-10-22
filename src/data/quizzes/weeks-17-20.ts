import type { QuizQuestion } from '../types';
import { adv, basic, mid } from './q';

export const quizzes17to20: Record<string, QuizQuestion[]> = {
  'w17-llm-read': [
    basic(
      'Where does the prompt text go in a Gemini `generateContent` request body?',
      [
        '`{ prompt: "..." }`',
        '*`{ contents: [{ parts: [{ text: "..." }] }] }`',
        '`{ messages: [{ content: "..." }] }`',
        'In the URL query',
      ],
      '`contents` is a list of turns, and each turn has `parts` (text, images, …).',
    ),
    basic(
      'What is a **token** for an LLM?',
      [
        'An API key',
        'One word, always',
        'A JWT',
        '*A chunk of text (part of a word, a word or punctuation) that the model processes; quotas, cost and latency scale with them',
      ],
      'Gemini returns counts in `usageMetadata`.',
    ),
    basic(
      'Where should the Gemini API key live?',
      [
        'In the frontend code',
        '*In a server-side env variable (`.env`, not committed), sent in a header and never logged',
        'In the Git repository',
        'In the article content',
      ],
      'If it leaks, rotate it in Google AI Studio.',
    ),
    basic(
      'What does lowering the **temperature** do?',
      [
        '*The output becomes more deterministic and focused',
        'Responses get shorter',
        'The model gets faster',
        'Token cost drops',
      ],
      'Low temperature suits summaries and structured output. Higher values suit creative text.',
    ),
    mid(
      'How do you make Gemini return JSON that matches a shape?',
      [
        'Say "please answer in JSON"',
        'Parse the text with regexes',
        'Use a different model',
        '*Set `generationConfig.responseMimeType: "application/json"` and a `responseSchema`',
      ],
      'Still validate the result on your side. The model can deviate.',
    ),
    mid(
      'What is the **system instruction** for?',
      [
        'Authentication',
        '*Rules and role kept separate from user content, for example "You are a technical editor; answer in JSON"',
        'Choosing the model',
        'Rate limiting',
      ],
      'It is a natural place for stable instructions, while the article goes into `contents`.',
    ),
    mid(
      'Which measures reduce **prompt injection** risk when sending article text to the model?',
      [
        '*Delimit untrusted content (for example in `<article>` tags) and say it is data, not instructions',
        '*Validate the output against a schema before using it',
        '*Never let model output trigger privileged actions without your own checks',
        'Asking the model nicely not to be hacked is enough',
      ],
      'Assume that any text written by users can contain instructions aimed at the model.',
    ),
    mid(
      'Why keep prompts in a dedicated templates module?',
      [
        'Gemini requires it',
        '*Prompts become versionable, testable (snapshots) and reusable instead of scattered strings in controllers',
        'Prompts run faster',
        'For Swagger',
      ],
      'The assignment scores this separately.',
    ),
    adv(
      "A very long article exceeds the model's **context window**. What are your options?",
      [
        'Nothing, the API handles it',
        '*Truncate, or summarize in chunks (map-reduce), keeping input plus output tokens within the limit',
        'Raise the temperature',
        'Send it twice',
      ],
      'The context window covers input and output tokens together.',
    ),
    adv(
      'How do you write reliable tests for code that calls an LLM?',
      [
        'Assert the exact text the model returns',
        "Don't test it",
        '*Mock the HTTP layer (`fetch`) with fixed responses and test your parsing, validation and error mapping',
        'Call the real API in CI',
      ],
      "Model output isn't deterministic. Your code around it is.",
    ),
  ],

  'w18-resilience-read': [
    basic(
      'Why add **jitter** to retry delays?',
      [
        'To make retries faster',
        'To make them deterministic',
        "*So many clients don't retry at the same moment (a thundering herd)",
        'Required by HTTP',
      ],
      'A random delay spreads the retry load over time.',
    ),
    basic(
      'Which failures are worth retrying?',
      ['*429, 5xx (such as 503) and timeouts', '400 Bad Request', '401 Unauthorized', '404 Not Found'],
      "Client errors won't succeed on retry without changing the request.",
    ),
    basic(
      'What does the `Retry-After` header tell the client?',
      [
        'Which server to retry',
        'How many retries are allowed',
        'The request id',
        '*How long to wait before retrying (seconds or an HTTP date)',
      ],
      'Send it with your 429s, and respect it when the upstream sends it.',
    ),
    basic(
      'What does status **429** mean?',
      ['Server overloaded', '*Too Many Requests: a rate limit was hit', 'Payment required', 'Request timeout'],
      'Your API returns it when `AI_RATE_LIMIT_RPM` is exceeded.',
    ),
    mid(
      'What does a **token bucket** limiter allow?',
      [
        'Exactly N requests per calendar minute',
        '*Bursts up to the bucket size, with an average rate equal to the refill rate',
        'One request at a time',
        'Unlimited requests for authenticated users',
      ],
      'Tokens refill steadily, and each request spends one.',
    ),
    mid(
      "Why include the article's `updatedAt` in the summary cache key?",
      [
        'To sort cache entries',
        'For TTL computation',
        '*Editing the article changes the key, so stale summaries are never served',
        'It is required by Gemini',
      ],
      'You get invalidation for free.',
    ),
    mid(
      'Exponential backoff with base 500 ms (no jitter). What are the delays before retries 1, 2 and 3?',
      ['*500 ms, 1000 ms, 2000 ms', '500 ms, 500 ms, 500 ms', '500 ms, 1500 ms, 4500 ms', '1000 ms, 1000 ms, 3000 ms'],
      '`base * 2 ** attempt` for attempts 0, 1, 2.',
    ),
    mid(
      'Which values belong in the **translate** cache key?',
      [
        '*`articleId`',
        '*`targetLanguage` (and `sourceLanguage`)',
        "*The article's `updatedAt`",
        'The request timestamp',
      ],
      'A timestamp would make every key unique, so nothing would ever be a cache hit.',
    ),
    adv(
      'What is the weakness of a **fixed-window** rate limiter?',
      [
        'It needs a database',
        '*Bursts at window boundaries: up to 2× the limit can pass within a short span across two windows',
        "It can't count requests",
        'It blocks all users at once',
      ],
      'Sliding windows or token buckets smooth this out.',
    ),
    adv(
      'Why is retrying **non-idempotent** operations dangerous?',
      [
        'Retries are slow',
        '*A request that succeeded but whose response was lost gets executed twice (for example two charges); use idempotency keys',
        'HTTP forbids it',
        "It isn't dangerous",
      ],
      'Generating text is safe to retry. Creating or charging something is not, unless you deduplicate.',
    ),
  ],

  'w19-rag-read': [
    basic(
      'What does RAG do to reduce hallucinations?',
      [
        'Fine-tunes the model',
        '*Retrieves relevant documents and puts them in the prompt as context for the answer',
        'Lowers the temperature',
        'Uses a larger model',
      ],
      'Answers are grounded in your data, and sources can be cited.',
    ),
    basic(
      'What is an **embedding**?',
      [
        'A compressed file',
        'A database index',
        '*A vector of numbers representing the meaning of text; similar meanings give nearby vectors',
        'A token count',
      ],
      'Gemini embedding models turn chunks and queries into vectors.',
    ),
    basic(
      'What does cosine similarity measure?',
      [
        'Euclidean distance',
        'Vector length',
        'Number of shared words',
        '*The angle between two vectors (direction), ignoring their magnitude',
      ],
      '1 = same direction, 0 = unrelated, −1 = opposite.',
    ),
    basic(
      'What is a vector database for?',
      [
        'Storing images only',
        '*Fast (approximate) nearest-neighbor search over many vectors, with metadata filtering',
        'Training models',
        'Replacing PostgreSQL',
      ],
      'Qdrant and Chroma use ANN indexes (such as HNSW) to search millions of vectors quickly.',
    ),
    mid(
      'Why do chunks **overlap**?',
      [
        '*So that context spanning a chunk boundary still appears whole in at least one chunk',
        'To save storage',
        'Embeddings require it',
        'To speed up indexing',
      ],
      'Typical overlap is 10–25% of the chunk size (200 of 800 here).',
    ),
    mid(
      'Why use different embedding task types for documents and queries?',
      [
        'Queries are cheaper',
        'It is required for authentication',
        '*The model optimizes vectors for asymmetric search: short questions vs longer passages',
        'Documents need more dimensions',
      ],
      '`RETRIEVAL_DOCUMENT` when indexing, `RETRIEVAL_QUERY` when searching.',
    ),
    mid(
      'Why store a metadata payload (`articleId`, title, status, tags) with each vector?',
      [
        '*For filtering (status, category, tags) and attribution (sources) without extra DB lookups',
        "Vectors can't be stored without it",
        'To improve similarity scores',
        'It is required by Gemini',
      ],
      'Source attribution is a scored requirement.',
    ),
    mid(
      'What goes wrong with chunks that are **too large**?',
      [
        '*Each embedding mixes several topics, so retrieval gets less precise',
        '*Fewer chunks fit into the prompt',
        'Retrieval precision improves',
        '*Every answer costs more tokens',
      ],
      'Chunk size is a trade-off between context and precision.',
    ),
    adv(
      'You switch embedding models and indexing fails with a dimension error. Why?',
      [
        'The API key changed',
        '*The collection was created with a fixed vector size; the new model produces vectors of a different length',
        'Qdrant only supports Gemini',
        'Chunks are too long',
      ],
      'Recreate the collection (and reindex) when the model or dimension changes.',
    ),
    adv(
      'For **normalized** (unit-length) vectors, cosine similarity equals…',
      ['Euclidean distance', '*The dot product', '1 always', 'The sum of components'],
      'That is why many vector DBs normalize vectors and use dot product internally.',
    ),
    adv(
      'Why derive chunk point ids deterministically (for example from `articleId:index`)?',
      [
        'Qdrant requires sorted ids',
        'For security',
        '*Re-indexing upserts the same ids instead of creating duplicates, which makes indexing idempotent',
        'To compress vectors',
      ],
      "Combined with deleting an article's old points first, this prevents stale vectors.",
    ),
  ],

  'w20-retrieval-read': [
    basic(
      'What is **hybrid retrieval**?',
      [
        'Searching two vector DBs',
        '*Combining dense (embedding) search with sparse or keyword (lexical) search',
        'Using two LLMs',
        'Caching search results',
      ],
      'Each catches results the other misses.',
    ),
    basic(
      'When does lexical search beat embeddings?',
      [
        '*Exact identifiers, error codes, product names, rare terms',
        'Paraphrased questions',
        'Questions in another language',
        'Never',
      ],
      'Embeddings blur exact tokens like `ERR_CRYPTO_HASH_FINALIZED`.',
    ),
    basic(
      'What does a **re-ranker** do?',
      [
        'Sorts by date',
        'Removes duplicates',
        'Re-indexes the collection',
        '*Scores (query, chunk) pairs more carefully, often with a stronger model, to reorder the top results',
      ],
      'More accurate but slower, so it is applied only to the top-N candidates.',
    ),
    basic(
      'What is BM25?',
      [
        'An embedding model',
        '*A lexical ranking function based on term frequency and inverse document frequency',
        'A vector index',
        'A compression format',
      ],
      'It is the classic relevance formula behind full-text search engines.',
    ),
    mid(
      'How does **reciprocal rank fusion** score a document?',
      [
        'Average of the raw similarity scores',
        'The maximum rank',
        '*Sum over the result lists of `1 / (k + rank)`',
        'The number of lists it appears in',
      ],
      "It uses ranks only, so the scales of the different systems don't matter.",
    ),
    mid(
      'Why re-rank only the top-N results?',
      [
        '*Re-ranking is expensive (an extra model call per candidate), so it is applied where it matters',
        'Vector DBs return at most N',
        'Lower results are always irrelevant',
        'For caching',
      ],
      'Typical: retrieve 20–50, re-rank, keep 5.',
    ),
    mid(
      'Which metrics evaluate **retrieval** quality?',
      ['*Recall@k', '*MRR (mean reciprocal rank)', '*Precision@k', 'GPU temperature'],
      'Build a small set of question → expected-article pairs and measure these.',
    ),
    mid(
      'Why fuse **ranks** rather than raw scores from lexical and vector search?',
      [
        'Ranks are more precise',
        "*The scores live on different scales (BM25 vs cosine) and aren't directly comparable",
        'Scores are secret',
        'It is required by Qdrant',
      ],
      'RRF sidesteps score normalization.',
    ),
    adv(
      'What is the role of the constant `k` (often 60) in RRF?',
      [
        'The number of results',
        "*It dampens the influence of top ranks, so one list's #1 doesn't dominate",
        'The vector dimension',
        'The timeout',
      ],
      'With large `k`, documents ranked well in several lists win.',
    ),
    adv(
      'In a RAG chat, the user asks "what about its downsides?". What improves retrieval?',
      [
        'Embed the question as-is',
        'Increase `limit` to 100',
        '*Rewrite it into a standalone question using the conversation history before embedding',
        'Skip retrieval for follow-ups',
      ],
      '"its" means nothing to the vector DB. "What are the downsides of Docker multi-stage builds?" does.',
    ),
  ],

  'w20-interview-read': [
    basic(
      'What does "Node.js is single-threaded" really mean?',
      [
        "Node can't use multiple cores at all",
        '*Your JavaScript runs on one main thread; I/O is delegated to the OS and the libuv thread pool',
        'Only one request is handled at a time',
        'Node has no threads internally',
      ],
      'And you can opt into more threads (worker_threads) or processes (cluster).',
    ),
    basic(
      'Which Node.js releases are LTS?',
      ['Odd-numbered', '*Even-numbered', 'Every release', 'Releases with a .0 minor version'],
      'Production should run Active or Maintenance LTS.',
    ),
    basic(
      'What is the default injection scope of Nest providers?',
      ['Request', 'Transient', '*Singleton', 'Module'],
      'One instance shared across the whole app.',
    ),
    basic(
      'What does an exception filter do in Nest?',
      [
        'Validates input',
        'Logs every request',
        '*Turns thrown exceptions into HTTP responses',
        'Filters database rows',
      ],
      "Week 16's global filter maps custom errors to status codes.",
    ),
    mid(
      'Interceptor vs guard?',
      [
        'Same thing',
        'Guards transform responses',
        '*Interceptors wrap the handler (transform responses, log, cache); guards decide whether the request may proceed',
        'Interceptors run only on errors',
      ],
      'Password stripping is an interceptor. JWT checking is a guard.',
    ),
    mid(
      'What does horizontal scaling of a Node API require?',
      [
        '*Stateless instances, with shared state in a database or cache',
        'A bigger server',
        'Worker threads',
        'Sticky sessions always',
      ],
      'Then add instances behind a load balancer.',
    ),
    mid(
      'Which are Node.js **core** modules?',
      ['*`fs`', '*`http`', '*`events`', '*`stream`', '`lodash`'],
      'Import core modules with the `node:` prefix for clarity.',
    ),
    mid(
      'An `EventEmitter` emits `"error"` and nobody listens. What happens?',
      [
        'Nothing',
        'A warning is printed',
        '*The error is thrown, which usually crashes the process',
        'The emitter retries',
      ],
      '`"error"` is special: always attach a listener (or use `pipeline`/`once`).',
    ),
    adv(
      'Which is **not** a built-in Nest microservice transport?',
      ['TCP', 'NATS', '*SMTP', 'Kafka'],
      'Built-ins include TCP, Redis, NATS, MQTT, RabbitMQ, Kafka and gRPC.',
    ),
    adv(
      'How do you investigate a memory leak in a Node service?',
      [
        'Restart it every hour',
        '*Take heap snapshots over time (`--inspect` + DevTools, or `writeHeapSnapshot`) and compare what keeps growing',
        'Raise `--max-old-space-size` until it stops',
        'Use worker threads',
      ],
      'Common culprits: growing caches or Maps, uncleared timers, listeners added on every request.',
    ),
    adv(
      'What is the **cache-aside** pattern?',
      [
        'The cache writes to the DB',
        '*The app checks the cache; on a miss it loads from the DB and stores the result in the cache',
        'The DB pushes changes to the cache',
        'All reads go to the DB',
      ],
      'Your AI response cache from week 18 is cache-aside.',
    ),
    adv(
      'Which statement about GraphQL vs REST is true?',
      [
        'GraphQL is always faster',
        '*GraphQL lets clients choose fields over a single endpoint, but resolvers easily create N+1 queries (solved with DataLoader)',
        "REST can't paginate",
        'GraphQL needs no schema',
      ],
      'Pick based on the needs of your clients.',
    ),
  ],
};
