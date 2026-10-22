import type { QuizQuestion } from '../types';
import { adv, basic, mid } from './q';

export const quizzes01to04: Record<string, QuizQuestion[]> = {
  'w01-install-read': [
    basic(
      'Which Node.js major versions become **LTS** releases?',
      [
        'Odd-numbered ones (21, 23, 25)',
        '*Even-numbered ones (20, 22, 24)',
        'Every major version',
        'Only versions marked "Current"',
      ],
      'Even-numbered majors move to Active LTS about six months after release and are supported for ~30 months. Odd-numbered majors are "Current" only and are short-lived.',
    ),
    basic(
      'Which file records the **exact resolved versions** of the whole dependency tree?',
      ['`package.json`', '`.npmrc`', '*`package-lock.json`', '`node_modules/.package.json`'],
      '`package.json` declares version **ranges**. `package-lock.json` pins the exact versions (and integrity hashes) that were installed, so every machine gets the same tree.',
    ),
    basic(
      'What does **nvm** manage?',
      [
        '*Several Node.js versions installed side by side for your user',
        'Global npm packages',
        'Running Node processes, like pm2',
        'npm registry credentials',
      ],
      'nvm installs multiple Node.js versions and switches between them per shell, which is how you keep Node 24 for the course next to a newer system Node.',
    ),
    basic(
      'A dependency is declared as `"^1.4.2"`. Which version may npm install?',
      ['Exactly `1.4.2`', 'Only `1.4.x`', '`2.0.0`', '*`1.9.0`'],
      'The caret allows any version that does not change the left-most non-zero digit: `>=1.4.2 <2.0.0`.',
    ),
    mid(
      'A dependency is declared as `"~1.4.2"`. Which of these satisfies it?',
      ['*`1.4.9`', '`1.5.0`', '`2.0.0`', '`1.4.1`'],
      'The tilde allows patch updates only: `>=1.4.2 <1.5.0`.',
    ),
    mid(
      'What does `npm ci` do differently from `npm install`?',
      [
        'It upgrades every package to the latest version',
        'It installs only `devDependencies`',
        'It rewrites `package-lock.json` to match `package.json`',
        '*It deletes `node_modules` and installs exactly what the lockfile says, failing if the lockfile and `package.json` disagree',
      ],
      '`npm ci` is for reproducible installs (CI, Docker builds). It never modifies the lockfile.',
    ),
    mid(
      'Which packages belong in `devDependencies` of a Fastify API written in TypeScript?',
      ['*`typescript`', '*`vitest`', '`fastify`', '*`@types/node`'],
      'Anything needed only to build, type-check or test goes to `devDependencies`. `fastify` is needed at runtime, so it is a regular dependency.',
    ),
    mid(
      "`vite` is in your project's `devDependencies`. What does `npx vite` do?",
      [
        'Installs vite globally, then runs it',
        '*Runs the project-local binary from `node_modules/.bin/vite`',
        'Always downloads the latest vite from the registry',
        'Fails: npx only works for globally installed packages',
      ],
      "npx prefers the locally installed binary. It only downloads a package temporarily when it can't find one locally.",
    ),
    adv(
      'A dependency is declared as `"^0.3.1"`. What range does npm accept?',
      ['Any `0.x.x`', '*`>=0.3.1 <0.4.0`', '`>=0.3.1 <1.0.0`', 'Only `0.3.1`'],
      'For `0.x` versions the caret locks the first **non-zero** digit, because in semver `0.x` minor bumps may be breaking.',
    ),
    adv(
      'Which statements about `.nvmrc` are true?',
      [
        '*`nvm use` without arguments reads the version from it',
        '*Switching applies to the current shell session only',
        'It changes the system-wide Node.js installation',
        '*Switching automatically on `cd` needs a shell hook (or a tool like fnm or volta)',
      ],
      'nvm is a shell function. It changes `PATH` for the current shell and does nothing automatically unless you add a hook.',
    ),
    adv(
      '`package.json` has `"engines": { "node": ">=24.10" }` and you run `npm install` on Node 22. With default settings, what happens?',
      [
        'Installation fails',
        '*npm prints an `EBADENGINE` warning and installs anyway',
        'npm downloads Node 24',
        'Nothing at all',
      ],
      'The engines field is advisory by default. Set `engine-strict=true` in `.npmrc` to make it an error.',
    ),
  ],

  'w01-event-loop-read': [
    basic(
      'In which event loop phase do `setImmediate` callbacks run?',
      ['timers', 'poll', '*check', 'close callbacks'],
      'Phases go timers → pending callbacks → idle/prepare → poll → **check** → close callbacks. `setImmediate` callbacks run in the check phase, right after poll.',
    ),
    basic(
      'How many threads execute your JavaScript callbacks in one Node.js process without `worker_threads`?',
      ['*One', 'One per CPU core', 'Four, the libuv pool size', 'One per incoming request'],
      'JavaScript runs on a single main thread. libuv uses extra threads for some I/O, but your callbacks always come back to the main thread.',
    ),
    basic(
      'What does "non-blocking I/O" mean?',
      [
        'I/O runs faster because it uses several CPU cores',
        'I/O calls are never allowed to fail',
        '*The call starts the operation and returns immediately; the result is delivered later through a callback or promise',
        'The OS caches all files in memory',
      ],
      'While the operation is in progress, the main thread is free to handle other events.',
    ),
    basic(
      'In which phase do expired `setTimeout` and `setInterval` callbacks run?',
      ['*timers', 'check', 'poll', 'pending callbacks'],
      'The timers phase runs callbacks whose threshold has elapsed.',
    ),
    mid(
      'In a **CommonJS** script, in which order do these run?\n\n~~~js\nprocess.nextTick(() => console.log("A"));\nPromise.resolve().then(() => console.log("B"));\n~~~',
      ['B, then A', 'Random order', '*A, then B', 'Both are deferred to the timers phase'],
      'After the main script, Node drains the `nextTick` queue first, then the promise microtask queue. (In ESM it is the other way round: module evaluation itself runs as a microtask.)',
    ),
    mid(
      'Inside an `fs.readFile` callback you call `setTimeout(f, 0)` and `setImmediate(g)`. What is the order?',
      ['`f` always runs first', 'The order is random', 'Both run in the poll phase', '*`g` always runs first'],
      'I/O callbacks run in the poll phase. The next phase is check (`setImmediate`). Timers only come in the next loop iteration.',
    ),
    mid(
      'Which operations use the **libuv thread pool**?',
      [
        '*`fs.readFile`',
        '*`crypto.pbkdf2` (async)',
        '*`zlib.gzip` (async)',
        'Reading from a TCP socket',
        '`setTimeout`',
      ],
      "File system work, some crypto, zlib and `dns.lookup` run in the pool. Network sockets use the OS's async mechanisms (epoll/kqueue) on the main thread. Timers are managed by the loop itself.",
    ),
    mid(
      'An HTTP handler runs `while (Date.now() < start + 2000) {}`. What happens to other requests during those 2 seconds?',
      [
        'They are served by another thread',
        'Only this request waits',
        '*They all wait: the event loop is blocked',
        'Timers keep firing normally',
      ],
      'Synchronous CPU work blocks the only JavaScript thread. Nothing else, including timers and other requests, can run until it finishes.',
    ),
    adv(
      'What does this CommonJS script print?\n\n~~~js\nsetTimeout(() => console.log("T"), 0);\nPromise.resolve()\n  .then(() => {\n    console.log("P1");\n    process.nextTick(() => console.log("N"));\n  })\n  .then(() => console.log("P2"));\n~~~',
      ['P1 N P2 T', '*P1 P2 N T', 'N P1 P2 T', 'T P1 P2 N'],
      'Once Node starts draining the promise microtask queue, it drains it completely, including `P2` which is queued while `P1` runs. Only then does it go back to the `nextTick` queue (`N`). Timers come after all microtasks.',
    ),
    adv(
      'What happens here?\n\n~~~js\nfunction f() { process.nextTick(f); }\nf();\nsetTimeout(() => console.log("t"), 0);\n~~~',
      [
        'Prints `t` after about 1 ms',
        'Throws `RangeError: Maximum call stack size exceeded`',
        'Prints `t` once the thread pool frees up',
        '*`t` is never printed: the `nextTick` queue never empties, so the loop never reaches the timers phase',
      ],
      "Recursive `nextTick` starves the event loop. It isn't a stack overflow, because each call runs from the queue rather than nested in the previous one. `setImmediate` doesn't have this problem.",
    ),
    adv(
      'Why can `setTimeout(f, 0)` and `setImmediate(g)` swap order between runs when called from the **main module**?',
      [
        "*The timer's 1 ms threshold may or may not have elapsed when the loop first checks timers; that depends on process performance",
        'The libuv thread pool schedules them randomly',
        'Garbage collection reorders callbacks',
        'Node deliberately randomizes them',
      ],
      'If the loop enters the timers phase before 1 ms has passed, the timer waits and `setImmediate` runs first. Otherwise the timeout runs first.',
    ),
    adv(
      'What is the effective minimum delay of `setTimeout(cb, 0)` in Node.js?',
      ['0 ms', '*1 ms: delays below 1 are set to 1', '4 ms, as in browsers after nesting', '10 ms'],
      'Node coerces delays smaller than 1 (or invalid) to 1 ms. You can see it as `timeout._idleTimeout === 1`.',
    ),
  ],

  'w01-modules-fs-read': [
    basic(
      'What is the explicit, reliable way to make `.js` files in a package load as **ES modules**?',
      [
        'Use `import` at the top of every file',
        'Put them in a `src/` folder',
        '*Add `"type": "module"` to the nearest `package.json`',
        'Run node with `--esm`',
      ],
      'The nearest `package.json` "type" field decides how `.js` files load. Node 24 can also detect ESM syntax in ambiguous files, but relying on that is fragile.',
    ),
    basic(
      'Which file extension is **always** treated as an ES module?',
      ['`.cjs`', '*`.mjs`', '`.ts`', '`.jsx`'],
      '`.mjs` is always ESM and `.cjs` is always CommonJS, whatever `package.json` says.',
    ),
    basic(
      'In ESM, what replaces CommonJS `__dirname`?',
      ['`process.cwd()`', '`module.dirname`', '`require.main.path`', '*`import.meta.dirname`'],
      '`import.meta.dirname` and `import.meta.filename` exist since Node 20.11. `process.cwd()` is where you started node from, which is a different thing.',
    ),
    basic(
      'Which import gives you promise-based file system functions?',
      [
        '*`import { readFile } from "node:fs/promises"`',
        '`import { readFileSync } from "node:fs"`',
        '`import { readFile } from "node:fs"`, which returns a promise',
        '`import fs from "node:path"`',
      ],
      '`node:fs/promises` exports async functions that return promises. The ones in `node:fs` are callback-based or synchronous.',
    ),
    mid(
      'What does `await import("./plugin.js")` resolve to?',
      [
        'The default export only',
        'The source code of the file',
        'The `run` function, if exported',
        '*A module namespace object: named exports are properties, and the default export is under `.default`',
      ],
      'Dynamic `import()` returns a promise for the module namespace object.',
    ),
    mid(
      'Why is "check with `fs.access`, then `fs.readFile`" discouraged?',
      [
        '*The file can change between the two calls (a race). Just try the operation and handle `ENOENT`',
        '`access` only works on directories',
        '`access` is synchronous and blocks',
        '`readFile` cannot read files that `access` checked',
      ],
      'This is a time-of-check-to-time-of-use (TOCTOU) race. The Node docs recommend attempting the operation directly and handling the error.',
    ),
    mid(
      'What does `readdir(dir, { withFileTypes: true })` return?',
      [
        'File names as strings',
        'Full `Stats` objects',
        '*`Dirent` objects with methods like `isFile()` and `isDirectory()`',
        'A readable stream of entries',
      ],
      '`Dirent`s tell you the entry type without an extra `stat` call per entry.',
    ),
    mid(
      'What is `process.argv` for `node app.js --ext txt`?',
      [
        '`["--ext", "txt"]`',
        '`{ ext: "txt" }`',
        '`"node app.js --ext txt"`',
        '*`[execPath, "/abs/path/app.js", "--ext", "txt"]`',
      ],
      'The first two entries are the node binary and the script path. `util.parseArgs` can turn the rest into an object.',
    ),
    adv(
      'Which statements are true in **Node 24**?',
      [
        '*ESM can `import` a CommonJS module, and `module.exports` becomes the default export',
        '*CommonJS can `require()` an ES module, as long as it has no top-level `await`',
        'ESM code can call `require` directly, without `createRequire`',
        '*In ESM, relative import specifiers must include the file extension',
      ],
      "`require(esm)` is enabled by default in modern Node for synchronous ES modules. ESM has no `require` unless you build one with `module.createRequire`. ESM resolution doesn't add extensions for you.",
    ),
    adv(
      'How do you delete a directory **with its contents** using promises?',
      ['`fs.unlink(dir)`', '`fs.rmdir(dir)`', '`fs.rm(dir)`', '*`fs.rm(dir, { recursive: true, force: true })`'],
      'Without `recursive`, `rm` refuses to remove directories and `rmdir` only removes empty ones. `force` ignores a missing path.',
    ),
    adv(
      'File `/proj/src/a.mjs` is run as `cd /proj && node src/a.mjs`. What does it print?\n\n~~~js\nimport path from "node:path";\nconsole.log(path.relative(process.cwd(), import.meta.dirname));\n~~~',
      ['`/proj/src`', '*`src`', '`.`', '`../src`'],
      '`process.cwd()` is `/proj` (where you ran node). `import.meta.dirname` is `/proj/src` (where the file lives). The relative path between them is `src`.',
    ),
  ],

  'w02-streams-read': [
    basic(
      'What are the four fundamental stream types in Node.js?',
      [
        'Input, Output, Pipe, Buffer',
        '*Readable, Writable, Duplex, Transform',
        'File, Socket, Process, Memory',
        'Sync, Async, Object, Binary',
      ],
      'Duplex is both readable and writable (for example a TCP socket). Transform is a Duplex whose output is computed from its input.',
    ),
    basic(
      'What kind of stream does `zlib.createGzip()` return?',
      ['Readable', 'Writable', '*Transform', 'It returns a Buffer, not a stream'],
      'You write raw bytes in and read compressed bytes out, which is a Transform.',
    ),
    basic(
      'What does `writable.write(chunk)` returning `false` mean?',
      [
        'The write failed',
        '*The internal buffer is above `highWaterMark`; stop writing and wait for `"drain"`',
        'The stream is closed',
        'The chunk was dropped',
      ],
      'The chunk was still accepted. `false` is a backpressure signal. If you ignore it, memory keeps growing.',
    ),
    basic(
      'Which event tells you a **Readable** has no more data?',
      ['`"finish"`', '`"drain"`', '`"close"`', '*`"end"`'],
      '`"end"` is for Readables. `"finish"` is for Writables, after `end()` and once all data is flushed.',
    ),
    mid(
      'Why prefer `pipeline()` over chaining `.pipe()`?',
      [
        '`.pipe()` is deprecated',
        'It is faster',
        'It only works in object mode',
        '*It forwards errors, destroys all streams on failure, and has a promise version in `stream/promises`',
      ],
      'With `.pipe()` an error in one stream isn\'t propagated, so the others may stay open (leaking file descriptors), and an unhandled `"error"` crashes the process.',
    ),
    mid(
      'What does `objectMode: true` change?',
      [
        '*Chunks can be any JavaScript value, and `highWaterMark` counts objects instead of bytes',
        'Chunks are automatically JSON-serialized',
        'The stream becomes synchronous',
        'Only plain objects are allowed, not strings',
      ],
      'Object mode is how you stream parsed records (for example CSV rows) between transforms.',
    ),
    mid(
      'Why must a line-splitting Transform keep the incomplete "tail" of each chunk?',
      [
        'To support Windows line endings',
        'Because `push()` can only be called once per chunk',
        '*Chunks are arbitrary byte slices, so a line can be split across two chunks',
        'To make flush() optional',
      ],
      'Keep the text after the last `\\n`, prepend it to the next chunk, and emit what remains in `flush()`.',
    ),
    mid(
      'Which of these can be the **source** of `stream.pipeline()`?',
      [
        '*A Readable stream',
        '*An async generator function',
        '*An array of strings (any iterable)',
        'A `URL` object pointing to a file',
      ],
      'pipeline accepts streams, iterables, async iterables, and functions returning them. A URL is not iterable: open a read stream for it instead.',
    ),
    adv(
      'What is the default `highWaterMark` of `fs.createReadStream`?',
      ['4 KiB', '16 KiB', '*64 KiB', '1 MiB'],
      'File read streams read in 64 KiB chunks by default (`readableHighWaterMark === 65536`).',
    ),
    adv(
      'Does `for await (const chunk of readable) { await slowWork(chunk); }` respect backpressure?',
      [
        'No: all chunks are buffered in memory first',
        '*Yes: the stream is not read further until each iteration finishes',
        'Only in object mode',
        'Only if you call `readable.pause()` yourself',
      ],
      'Async iteration pulls one chunk at a time, so a slow consumer slows the producer down.',
    ),
    adv(
      "When is a Transform's `flush(callback)` called?",
      [
        'On every chunk',
        'When an error occurs',
        '*After all written data has been transformed, before `"end"` is emitted',
        'Only when the stream is destroyed',
      ],
      'It is the place to emit buffered leftovers, such as the last line or the closing `]` of a JSON array.',
    ),
    adv(
      'What is wrong with this code if `in.txt` does not exist?\n\n~~~js\nfs.createReadStream("in.txt")\n  .pipe(zlib.createGzip())\n  .pipe(fs.createWriteStream("out.gz"));\n~~~',
      [
        'Nothing: `.pipe()` forwards the error to the write stream',
        'A gzip stream cannot be the target of `.pipe()`',
        '*The read stream\'s `"error"` is not handled, so the process crashes, and the write stream is left open',
        'The write stream must be created after the read stream ends',
      ],
      'Use `await pipeline(src, gzip, dest)` to handle errors and clean up every stream.',
    ),
  ],

  'w02-crypto-zlib-read': [
    basic(
      'After feeding data to a `Hash` with `.update()`, how do you get the hex string?',
      ['`hash.toString("hex")`', '*`hash.digest("hex")`', '`hash.end("hex")`', '`hash.read("hex")`'],
      '`digest()` finalizes the hash and returns the result in the given encoding.',
    ),
    basic(
      'Which function creates a **Brotli** compression stream?',
      ['`zlib.createGzip()`', '`zlib.createDeflate()`', '*`zlib.createBrotliCompress()`', '`zlib.createBr()`'],
      'The Brotli pair is `createBrotliCompress()` / `createBrotliDecompress()`.',
    ),
    basic(
      'How long is a SHA-256 digest in hex?',
      ['32 characters', '*64 characters', '128 characters', 'It depends on the input size'],
      '256 bits = 32 bytes = 64 hex characters, whatever the input size.',
    ),
    basic(
      'What is the key difference between hashing and encryption?',
      [
        "*A hash is one-way and can't be reversed; encryption can be reversed with the key",
        "Hashing needs a key, encryption doesn't",
        'Encryption is always faster',
        'There is none; they are synonyms',
      ],
      'Hashes are for integrity and fingerprints. Encryption is for confidentiality.',
    ),
    mid(
      'What happens if you call `hash.digest()` twice on the same Hash?',
      [
        'It returns the same value again',
        '*The second call throws `ERR_CRYPTO_HASH_FINALIZED`',
        'It returns an empty string',
        'It resets and hashes nothing',
      ],
      'A Hash can be finalized once. Use `hash.copy()` before digesting if you need intermediate digests.',
    ),
    mid(
      'Why size a worker pool with `os.availableParallelism()` rather than `os.cpus().length`?',
      [
        'It is the same value under another name',
        '`cpus()` is deprecated',
        '*It estimates the parallelism actually available to the process, and is the documented choice for pool sizes',
        'It counts GPU cores too',
      ],
      '`availableParallelism()` is cheaper (no CPU info objects) and is what the docs recommend for this purpose.',
    ),
    mid(
      'Which statements about zlib streams are true?',
      [
        '*`createGzip()` is a Transform stream',
        '*Output of `createGzip()` can be decompressed with `createGunzip()` or the `gunzip` CLI',
        'Brotli output can be read with `gunzip`',
        '*They can be used inside `stream.pipeline()`',
      ],
      'Gzip and Brotli are different formats. Use the matching decompressor.',
    ),
    mid(
      'What does `crypto.randomUUID()` generate?',
      [
        'A version 1 (timestamp) UUID',
        '*A random version 4 UUID',
        'A version 7 (time-ordered) UUID',
        'A SHA-1 based UUID',
      ],
      'It returns an RFC 4122 v4 UUID from a cryptographically secure random source.',
    ),
    adv(
      'Why compare secrets (for example HMAC signatures) with `crypto.timingSafeEqual` instead of `===`?',
      [
        "`===` doesn't work on Buffers",
        '*`===` may stop at the first different character, so response timing leaks how much of the guess is right',
        'It is faster',
        'It handles different encodings',
      ],
      'A constant-time comparison stops attackers from recovering a signature byte by byte from timing. Note: both buffers must have the same length.',
    ),
    adv(
      'Is MD5 acceptable here?',
      [
        'Yes, for password storage',
        'No, never for anything',
        '*For detecting accidental file corruption, yes; for security (signatures, passwords) no, because collisions can be crafted',
        'Only with a salt',
      ],
      'MD5 is cryptographically broken but still catches random corruption. For passwords use bcrypt/scrypt/argon2.',
    ),
    adv(
      'A request handler calls `zlib.gzipSync()` on a 50 MB body. What is the problem?',
      [
        '*It blocks the event loop for the whole compression. Use the async or stream API, which runs in the thread pool',
        "gzipSync can't handle more than 1 MB",
        'It corrupts binary data',
        'There is no problem',
      ],
      'The `*Sync` zlib functions run on the main thread. Every other request waits.',
    ),
  ],

  'w02-threads-cp-read': [
    basic(
      'What kind of work benefits from **worker threads**?',
      [
        '*CPU-bound work: parsing, sorting, hashing large data',
        'Database queries',
        'HTTP requests to other services',
        'Reading many small files',
      ],
      'I/O is already non-blocking. Workers help when JavaScript itself is busy computing.',
    ),
    basic(
      'Which module provides worker threads?',
      ['`node:cluster`', '`node:child_process`', '`node:os`', '*`node:worker_threads`'],
      'Cluster and child_process create **processes**. `worker_threads` creates threads within one process.',
    ),
    basic(
      'What is the main difference between `spawn` and `exec`?',
      [
        "*`spawn` streams output and doesn't use a shell by default; `exec` runs in a shell and buffers all output",
        '`exec` is asynchronous, `spawn` is synchronous',
        '`spawn` only runs Node scripts',
        'There is none',
      ],
      '`exec` is convenient for short commands with small output. `spawn` suits long-running processes or large output.',
    ),
    basic(
      'Which function starts a new **Node.js** process with a built-in IPC channel?',
      ['`exec`', '`execFile`', '`spawn`', '*`fork`'],
      '`fork(modulePath)` is a `spawn` of node with an IPC channel, so `child.send()` and `process.on("message")` work.',
    ),
    mid(
      'How does data sent with `worker.postMessage(obj)` reach the worker?',
      [
        'By reference: both threads share the object',
        'As a JSON string',
        '*As a structured clone (a copy), unless it is transferred or is a SharedArrayBuffer',
        'Through a temporary file',
      ],
      'Structured cloning copies the data. Transferable objects such as `ArrayBuffer` can be moved without copying.',
    ),
    mid(
      'Which can be passed to a worker **without copying**?',
      [
        '*An `ArrayBuffer` listed in the transfer list',
        '*A `SharedArrayBuffer`',
        'A class instance with methods',
        'A function',
      ],
      "Class instances are cloned as plain objects (the prototype is lost). Functions can't be cloned at all (`DataCloneError`).",
    ),
    mid(
      'What is the risk of `exec("ls " + userInput)`?',
      [
        'It is slow',
        'Output is truncated',
        '*Shell injection: input like `; rm -rf ~` runs arbitrary commands',
        'None, exec escapes arguments',
      ],
      'Use `execFile` or `spawn` with an arguments array, so input is never parsed by a shell.',
    ),
    mid(
      "How do you make the parent exit with the child's exit code?",
      [
        '`process.exitCode = child.pid`',
        '*`child.on("close", (code) => process.exit(code ?? 1))`',
        '`child.kill(process.exitCode)`',
        'It happens automatically',
      ],
      '`code` is `null` when the child was killed by a signal, hence the fallback.',
    ),
    adv(
      'Why use a worker **pool** instead of starting a new worker per task?',
      [
        'Workers can only run once',
        '*Each worker has its own V8 isolate and event loop, so startup costs time and memory',
        'The number of workers is limited to 4',
        'Pools are needed for structured cloning',
      ],
      'Starting a worker takes tens of milliseconds and several MB. Reuse them for many small tasks.',
    ),
    adv(
      'For a `ChildProcess`, what is the difference between `"exit"` and `"close"`?',
      [
        'They are the same',
        '*`"close"` fires after the stdio streams are closed; `"exit"` can fire before all output has been read',
        '`"exit"` only fires on errors',
        '`"close"` only fires for `fork`',
      ],
      'If you need all output, wait for `"close"`.',
    ),
    adv(
      'The main thread calls `worker.postMessage(new Map([[1, "a"]]))`. What does the worker receive?',
      ['A plain object `{ 1: "a" }`', '*A `Map`', 'A `DataCloneError` is thrown', '`undefined`'],
      'The structured clone algorithm supports `Map`, `Set`, `Date`, `RegExp`, typed arrays and more, unlike JSON.',
    ),
  ],

  'w03-repl-read': [
    basic(
      'What does `path.resolve("/home/u", "/etc")` return?',
      ['`/home/u/etc`', '*`/etc`', 'It throws', '`home/u/etc`'],
      '`resolve` works right to left and stops at the first absolute segment.',
    ),
    basic(
      'What does `path.join("a", "..", "b")` return?',
      ['`a/../b`', '`a/b`', '*`b`', '`/b`'],
      '`join` concatenates the segments and normalizes `..`.',
    ),
    basic(
      'Which readline event handles **Ctrl+C**?',
      ['`"close"`', '`"exit"`', '*`"SIGINT"`', '`"line"`'],
      '`rl.on("SIGINT", …)` lets you print a goodbye message before closing.',
    ),
    basic(
      'What does `os.homedir()` return?',
      [
        "*The current user's home directory",
        'The directory node was started from',
        'The project root',
        'The root of the drive',
      ],
      'This CLI starts its working directory there.',
    ),
    mid(
      'What is the key difference between `path.join` and `path.resolve`?',
      [
        'They are aliases',
        '`join` returns absolute paths, `resolve` relative ones',
        '*`resolve` always returns an absolute path (it uses the cwd if needed); `join` just concatenates and normalizes',
        '`resolve` checks that the path exists',
      ],
      'Neither touches the file system. They are pure string operations.',
    ),
    mid(
      'How do you get the root of a path in a cross-platform way, `/` or `C:\\`?',
      ['*`path.parse(p).root`', '`p.split("/")[0]`', '`path.sep`', '`os.root()`'],
      '`path.parse` splits a path into root, dir, base, name and ext for the current platform.',
    ),
    mid(
      'What does `path.dirname("/")` return?',
      ['*`/`', 'An empty string', '`.`', '`null`'],
      'The parent of the root is the root. That is why `up` at the root naturally "does nothing".',
    ),
    mid(
      'When does a readline interface emit `"close"`?',
      [
        '*When `rl.close()` is called',
        '*When the input ends (Ctrl+D, or the end of piped input)',
        '*On Ctrl+C, if no `"SIGINT"` listener is registered on the interface',
        'After every entered line',
      ],
      'Handle `"close"` once and print the goodbye message there. It covers every way of leaving.',
    ),
    adv(
      'Why does the Data Processing CLI keep its **own** cwd variable instead of `process.chdir()`?',
      [
        "`process.chdir` doesn't exist on macOS",
        "*Explicit app state is easier to reason about and test, and doesn't change process-wide behavior for code that relies on `process.cwd()`",
        '`process.chdir` is synchronous',
        'Only workers may call `chdir`',
      ],
      '`process.chdir` is global to the process, which surprises other modules. Passing state explicitly is cleaner.',
    ),
    adv(
      'A server serves files from `/srv/public` using a user-supplied path. Which check prevents **path traversal**?',
      [
        'Reject input containing `".."`',
        '`path.join(base, input)` is safe on its own',
        '*Resolve first, then verify: `const p = path.resolve(base, input); if (!p.startsWith(base + path.sep)) reject()`',
        'URL-encode the input',
      ],
      'String filters miss encodings and absolute paths. Always check the final resolved path.',
    ),
    adv(
      'Code running on Linux has to parse Windows paths from a config file. Which API do you use?',
      ['`path` with `path.sep = "\\"`', '*`path.win32`', '`url.pathToFileURL`', "It isn't possible"],
      '`path.win32` and `path.posix` are available on every platform.',
    ),
  ],

  'w04-crypto-read': [
    basic(
      'How many bytes long is an AES-**256** key?',
      ['16', '24', '*32', '256'],
      '256 bits / 8 = 32 bytes. `scrypt(password, salt, 32)` derives one.',
    ),
    basic(
      'What is the recommended IV (nonce) length for AES-GCM?',
      ['8 bytes', '*12 bytes', '16 bytes', '32 bytes'],
      "GCM is designed around 96-bit (12-byte) nonces. That is why the assignment's file header has 12 IV bytes.",
    ),
    basic(
      'When does a GCM decipher **verify** the authentication tag?',
      ['On `createDecipheriv()`', 'On every `update()`', 'On `setAuthTag()`', '*On `final()`'],
      'If the tag doesn\'t match, `final()` throws "Unsupported state or unable to authenticate data".',
    ),
    basic(
      'What is the purpose of a **salt** in key derivation?',
      [
        'To encrypt the password',
        '*The same password gives different keys, which defeats precomputed (rainbow) tables',
        'To make the key shorter',
        'To replace the IV',
      ],
      'The salt is random and stored with the ciphertext. It does not need to be secret.',
    ),
    mid(
      'Why derive the key with `scrypt` instead of using the password bytes directly?',
      [
        'Passwords are too long for AES',
        '`createCipheriv` only accepts hex',
        '*Passwords have the wrong length and low entropy; a slow, memory-hard KDF makes brute force expensive',
        'scrypt encrypts the file',
      ],
      'scrypt deliberately costs CPU and memory for every guess.',
    ),
    mid(
      'What happens if you reuse the same IV with the same key in GCM?',
      [
        'Nothing serious',
        'Decryption fails',
        'Only performance suffers',
        '*Confidentiality and integrity break: attackers can XOR ciphertexts and forge tags',
      ],
      'A random 12-byte IV for every encryption, plus a fresh salt, avoids this.',
    ),
    mid(
      'The file is `salt(16) + iv(12) + ciphertext + tag(16)`. Which options read **only the ciphertext**?',
      [
        '`{ start: 28, end: size - 16 }`',
        '*`{ start: 28, end: size - 17 }`',
        '`{ start: 27, end: size - 16 }`',
        '`{ offset: 28, length: size - 44 }`',
      ],
      '`end` is **inclusive** in `createReadStream`. The last ciphertext byte is at `size - 17`.',
    ),
    mid(
      'Which values must be stored next to the ciphertext so it can be decrypted later?',
      ['*The salt', '*The IV', '*The auth tag', 'The derived key', 'The password'],
      'Salt, IV and tag are public parameters. The key and password must never be stored in the file.',
    ),
    adv(
      'When **stream**-decrypting with GCM, the output file is written before `final()` checks the tag. What follows?',
      [
        'Nothing, GCM verifies every chunk',
        '*The output must be treated as untrusted until `final()` succeeds; on failure, delete the partial output',
        'You must buffer the whole file',
        'Streaming GCM is impossible',
      ],
      'Authentication covers the whole message, so a tampered file is only detected at the end.',
    ),
    adv(
      'Must the IV be kept secret?',
      [
        'Yes, like the key',
        '*No, it must be unique per encryption but can be public',
        'Only in CBC mode',
        'Only if no salt is used',
      ],
      'IVs are usually stored right before the ciphertext, as in this assignment.',
    ),
    adv(
      'Why `pipeline(src, cipher, out, { end: false })` when encrypting?',
      [
        'To make it faster',
        '*To keep `out` open so the auth tag can be written after the ciphertext',
        'Because cipher streams never end',
        'To avoid backpressure',
      ],
      'The tag is only available after `final()`, so you append it, then end the write stream yourself.',
    ),
  ],
};
