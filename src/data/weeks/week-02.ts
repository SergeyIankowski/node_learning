import { nodeApi, programModule } from '../links';
import type { Week } from '../types';

const PROJECT = 'w01-fundamentals';

export const week02: Week = {
  id: 'w02',
  number: 2,
  programWeek: 1,
  title: 'Streams, crypto, zlib, worker threads & child processes',
  short: 'Streams & threads',
  goals: [
    'Build Readable → Transform → Writable pipelines and understand backpressure',
    'Hash and compress data with streams',
    'Parallelize CPU work with worker_threads and run external commands with child_process',
    'Finish and self-score the "Node.js Fundamentals" assignment',
  ],
  modules: [programModule('nodejs-basics', 'Node.js basics')],
  tasks: [
    {
      id: 'w02-streams-read',
      kind: 'read',
      title: 'Streams and backpressure',
      summary: 'Streams are everywhere in Node: files, HTTP, sockets, process.stdin.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: Streams in Node.js', url: 'https://youtu.be/o1WPOQgPT3Y', lang: 'RU' },
        { title: 'Stream API', url: nodeApi('stream') },
        {
          title: 'stream/promises: pipeline()',
          url: nodeApi('stream', 'streampipelinesource-transforms-destination-options'),
        },
        { title: 'Backpressuring in streams', url: 'https://nodejs.org/en/learn/modules/backpressuring-in-streams' },
      ],
      questions: [
        'Name the 4 stream types. Which one is `process.stdin`? `fs.createWriteStream`? A zlib stream?',
        'What does `writable.write()` returning `false` mean, and what should you do then?',
        'Why prefer `pipeline()` over `.pipe()`? (Error propagation and cleanup.)',
        'What is `highWaterMark`? What is object mode?',
        'Why does a Transform that splits text into lines need to keep the "tail" of the previous chunk?',
      ],
    },
    {
      id: 'w02-crypto-zlib-read',
      kind: 'read',
      title: 'crypto, zlib, os',
      summary: 'Hashing, compression and system info APIs.',
      estimateH: 1.5,
      resources: [
        { title: 'Crypto API', url: nodeApi('crypto') },
        { title: 'Zlib API (gzip, brotli)', url: nodeApi('zlib') },
        { title: 'OS API', url: nodeApi('os') },
      ],
      questions: [
        'Why is `crypto.createHash()` a stream (Transform), and how do you get the final hex digest?',
        'What is the difference between gzip/deflate and brotli (`createBrotliCompress`)?',
        'What is the difference between `os.cpus().length` and `os.availableParallelism()`?',
      ],
    },
    {
      id: 'w02-threads-cp-read',
      kind: 'read',
      title: 'Worker threads and child processes',
      summary: 'Two ways to escape the single JS thread.',
      estimateH: 1.5,
      resources: [
        { title: 'Worker threads API', url: nodeApi('worker_threads') },
        { title: 'Child processes API', url: nodeApi('child_process') },
      ],
      questions: [
        "When do worker threads help, and when don't they? (CPU-bound vs I/O-bound work)",
        'How do the main thread and a worker exchange data? What is structured cloning? What is a transferable?',
        'Difference between `spawn`, `exec`, `execFile` and `fork`?',
        'How do you forward the exit code of a child process?',
      ],
    },
    {
      id: 'w02-upper-transform',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: uppercase Transform stream',
      summary: 'Your first custom Transform with pipeline().',
      estimateH: 0.5,
      description: `Write \`upper.mjs\`. It reads stdin, uppercases the text with a custom \`Transform\` and writes it to stdout. Use \`pipeline\` from \`node:stream/promises\`.

Then add a second Transform that counts bytes, and print the total to **stderr** when the stream ends (in \`flush\`).`,
      run: 'echo "hello streams" | node upper.mjs\nnode upper.mjs < /usr/share/dict/words > /dev/null',
      expected: 'HELLO STREAMS\nbytes: 14',
      acceptance: [
        'Uses `Transform` + `pipeline`, not `.on("data")`',
        'The byte count is printed in `flush` and goes to stderr',
      ],
    },
    {
      id: 'w02-backpressure',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: see backpressure with your own eyes',
      summary: 'Write 5M lines with and without honoring write() === false.',
      estimateH: 1,
      description: `Write \`bp.mjs\`. It writes 5,000,000 lines to \`out.txt\` with \`fs.createWriteStream\` in two modes:

1. **Naive:** call \`ws.write(line)\` in a plain \`for\` loop.
2. **Correct:** when \`write()\` returns \`false\`, \`await once(ws, 'drain')\` before continuing.

Print \`process.memoryUsage().rss\` (in MB) at the end of each mode and compare.`,
      run: 'node bp.mjs naive\nnode bp.mjs correct',
      acceptance: [
        'Naive mode uses much more memory (hundreds of MB)',
        'Correct mode stays roughly flat',
        'You can explain the difference',
      ],
    },
    {
      id: 'w02-hash-verify',
      kind: 'code',
      title: 'hash: verify.js',
      summary: 'Verify SHA256 checksums with streams.',
      estimateH: 1,
      projectId: PROJECT,
      points: 12,
      description: `Implement \`src/hash/verify.js\`. It reads \`checksums.json\` (\`{ "file1.txt": "<sha256 hex>", … }\`), computes each file's SHA256 **with the Streams API** (\`createReadStream\` → \`createHash\`) and prints:

~~~
file1.txt — OK
file2.txt — FAIL
~~~

Missing \`checksums.json\` → \`FS operation failed\`.`,
      run: 'node src/hash/verify.js',
      acceptance: ['Hash is computed via streams, not `readFile`', 'Output format matches exactly (em dash `—`)'],
    },
    {
      id: 'w02-streams-line-numberer',
      kind: 'code',
      title: 'streams: lineNumberer.js',
      summary: 'Prefix each line from stdin with its number.',
      estimateH: 1,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/streams/lineNumberer.js\`: \`process.stdin\` → Transform → \`process.stdout\`. Each line gets its number prepended:

\`hello\\nworld\` → \`1 | hello\\n2 | world\``,
      run: 'printf "hello\\nworld" | node src/streams/lineNumberer.js',
      expected: '1 | hello\n2 | world',
      acceptance: [
        'Works when a line is split across two chunks',
        'Last line without a trailing newline is still numbered',
      ],
    },
    {
      id: 'w02-streams-filter',
      kind: 'code',
      title: 'streams: filter.js',
      summary: 'grep-like Transform using --pattern.',
      estimateH: 0.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Implement `src/streams/filter.js`: read stdin and write to stdout only the lines that contain `--pattern <string>`, using a Transform stream.',
      run: 'printf "apple\\nbanana\\npineapple\\n" | node src/streams/filter.js --pattern apple',
      expected: 'apple\npineapple',
      acceptance: ['Uses a Transform stream', 'Handles lines split across chunks'],
    },
    {
      id: 'w02-streams-split',
      kind: 'code',
      title: 'streams: split.js',
      summary: 'Split a file into chunk_N.txt files of at most N lines.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description:
        'Implement `src/streams/split.js`. Read `source.txt` with a **Readable stream** and split it into `chunk_1.txt`, `chunk_2.txt`, … Each chunk has at most `--lines N` lines (default 10).',
      run: 'node src/streams/split.js --lines 3 && wc -l chunk_*.txt',
      acceptance: [
        'Uses Streams API (no `readFile` of the whole file)',
        'Every chunk except the last has exactly N lines',
      ],
    },
    {
      id: 'w02-zip-compress',
      kind: 'code',
      title: 'zip: compressDir.js',
      summary: 'Pack a directory tree into a single brotli archive.',
      estimateH: 2,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/zip/compressDir.js\`. It packs **the whole tree** of \`workspace/toCompress/\` (paths + contents) into one \`workspace/compressed/archive.br\`, creating the folder if needed. Use streams.

There is no tar in the standard library, so **design your own container format**. For example, for each file write a header line \`<relativePath>\\t<size>\\n\` and then the raw bytes. Pipe that through \`createBrotliCompress()\`.

Missing \`toCompress\` → \`FS operation failed\`.`,
      run: 'node src/zip/compressDir.js && ls -la workspace/compressed',
      acceptance: [
        'Single `archive.br` file',
        'Empty directories are preserved too (add a "dir" record type)',
        'Uses streams',
      ],
      hints: [
        'An async generator that yields headers and file chunks can be passed to `pipeline()` as the source: `pipeline(gen(), createBrotliCompress(), createWriteStream(out))`.',
      ],
    },
    {
      id: 'w02-zip-decompress',
      kind: 'code',
      title: 'zip: decompressDir.js',
      summary: 'Unpack your archive format back into the original tree.',
      estimateH: 2,
      projectId: PROJECT,
      points: 10,
      description:
        'Implement `src/zip/decompressDir.js`: read `workspace/compressed/archive.br`, decompress it and parse your format, then recreate the tree in `workspace/decompressed/`. Missing `compressed` folder or `archive.br` → `FS operation failed`.',
      run: 'node src/zip/decompressDir.js && diff -r workspace/toCompress workspace/decompressed && echo IDENTICAL',
      expected: 'IDENTICAL',
      acceptance: ['Byte-identical result, including binary files', 'Parser handles headers split across chunks'],
    },
    {
      id: 'w02-wt-sort',
      kind: 'code',
      title: 'wt: parallel sort with k-way merge',
      summary: 'Sort chunks in N workers, merge them in the main thread.',
      estimateH: 3,
      projectId: PROJECT,
      points: 40,
      description: `**\`src/wt/worker.js\`** (+10): receive an array of numbers from the parent, sort it ascending, post it back.

**\`src/wt/main.js\`** (+30):
1. Read \`data.json\` (an array of numbers).
2. Split it into **N chunks**, where N = number of logical CPU cores.
3. Start N workers from \`worker.js\` and send one chunk to each.
4. Collect the results **in the order the workers were created**.
5. Merge them with a **k-way merge** (not \`concat().sort()\`!).
6. \`console.log\` the final array.`,
      run: 'node src/wt/main.js',
      acceptance: [
        'Number of workers = `os.availableParallelism()` (or `os.cpus().length`)',
        'Result order does not depend on which worker finishes first',
        'Real k-way merge (pointers per chunk, or a min-heap)',
      ],
      hints: ['Wrap each worker in a Promise and `await Promise.all(workers)`. `Promise.all` keeps the input order.'],
    },
    {
      id: 'w02-cp-exec',
      kind: 'code',
      title: 'cp: execCommand.js',
      summary: 'Spawn a command, pipe its output, forward its exit code.',
      estimateH: 1,
      projectId: PROJECT,
      points: 30,
      description: `Implement \`execCommand\` in \`src/cp/execCommand.js\`. It takes a command string from the CLI (\`node src/cp/execCommand.js "ls -la"\`) and starts it with **\`spawn\`**:
- child stdout → \`process.stdout\`, child stderr → \`process.stderr\`
- the child gets the parent's environment variables
- the parent exits with the child's exit code`,
      run: 'node src/cp/execCommand.js "ls -la"\nnode src/cp/execCommand.js "ls /nope"; echo "exit: $?"',
      expected: '…listing…\nls: /nope: No such file or directory\nexit: 1',
      acceptance: [
        'Uses `spawn` (with `shell: true` or by splitting the command)',
        'Exit code is forwarded',
        '`env: process.env` passed',
      ],
    },
    {
      id: 'w02-fundamentals-ship',
      kind: 'code',
      title: 'Ship & self-score: Node.js Fundamentals',
      summary: 'Run every script, check against the score sheet.',
      estimateH: 1,
      projectId: PROJECT,
      description: `Go through the project's **Scoring** list line by line, run each npm script and give yourself a score out of 200.

Then clean up: no \`console.log\` debugging left, no external dependencies in \`package.json\`, and a README that says how to run everything.`,
      run: 'npm run   # lists all scripts\ncat package.json | grep -A3 dependencies',
      acceptance: [
        'Self-score written down (target ≥ 170/200)',
        'No dependencies besides what the starter had',
        'Pushed to your fork',
      ],
    },
  ],
};
