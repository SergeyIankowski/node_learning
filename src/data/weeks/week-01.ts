import { assignment, nodeApi, programModule } from '../links';
import type { Week } from '../types';

const PROJECT = 'w01-fundamentals';

export const week01: Week = {
  id: 'w01',
  number: 1,
  programWeek: 1,
  title: 'Setup, event loop, modules, file system & CLI',
  short: 'Setup & event loop',
  goals: [
    'Install Node.js 24 with nvm and know what LTS means',
    'Explain the event loop phases, microtasks and why I/O is non-blocking',
    'Use ES modules, dynamic import, the fs/promises API and process.argv',
    'Solve the fs, cli and modules parts of the "Node.js Fundamentals" assignment',
  ],
  modules: [
    programModule('nodejs-installation', 'Node.js installation and configuration'),
    programModule('nodejs-basics', 'Node.js basics'),
  ],
  tasks: [
    {
      id: 'w01-install-read',
      kind: 'read',
      title: 'Installing Node.js, nvm and npm',
      summary: 'How Node is installed and versioned, and why you should use a version manager.',
      estimateH: 1,
      resources: [
        { title: 'Download / install Node.js', url: 'https://nodejs.org/en/download' },
        { title: 'nvm — Node Version Manager', url: 'https://github.com/nvm-sh/nvm#intro' },
        { title: 'Node.js releases (LTS schedule)', url: 'https://nodejs.org/en/about/previous-releases' },
        { title: 'npm: package.json reference', url: 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json' },
      ],
      questions: [
        'What is the difference between an LTS and a Current release? Why does the course pin Node 24?',
        'What is semver, and what do `^1.2.3` and `~1.2.3` allow?',
        'What is the difference between `dependencies` and `devDependencies`? What does `npm ci` do differently from `npm install`?',
        'What does an `.nvmrc` file do?',
      ],
    },
    {
      id: 'w01-nvm-node24',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: install Node 24 with nvm',
      summary: 'Get the exact Node version every assignment requires (24.10+).',
      estimateH: 0.5,
      description: `All course assignments require **Node.js 24.x (24.10.0 or newer)**. You may have a newer version installed system-wide, so use nvm to switch per project.

1. Install nvm (see the link in the theory task).
2. Install and select Node 24.
3. Create a folder \`~/rs-node\` for all course repositories and add an \`.nvmrc\` file containing \`24\`.
4. Check that \`nvm use\` inside that folder switches the version automatically (or add a shell hook so it does).`,
      run: 'nvm install 24\nnvm use 24\nnode -v && npm -v',
      expected: 'v24.x.x   (x ≥ 10 for the minor version)\n11.x.x',
      acceptance: [
        '`node -v` prints `v24.10.0` or newer inside your course folder',
        '`.nvmrc` exists and `nvm use` picks it up',
        'Git is installed and configured: `git config --global user.name` / `user.email`',
      ],
    },
    {
      id: 'w01-event-loop-read',
      kind: 'read',
      title: 'Event loop and non-blocking I/O',
      summary: 'The single most important concept in Node.js.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: Node.js basics (2022Q2)', url: 'https://www.youtube.com/watch?v=oXoSeVbXX_M', lang: 'RU' },
        { title: 'Lecture: Node.js basics (previous)', url: 'https://youtu.be/dcdjTqKV2_Q', lang: 'RU' },
        {
          title: 'The Node.js event loop, timers and process.nextTick()',
          url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
        },
        {
          title: 'Overview of blocking vs non-blocking',
          url: 'https://nodejs.org/en/learn/asynchronous-work/overview-of-blocking-vs-non-blocking',
        },
        {
          title: 'Discover JavaScript timers',
          url: 'https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers',
        },
        { title: 'Lecture: debugging Node.js', url: 'https://youtu.be/BP2I6VblN8U', lang: 'RU' },
      ],
      questions: [
        'Name the event loop phases in order. In which phase do `setTimeout`, `setImmediate` and I/O callbacks run?',
        'What is the difference between `process.nextTick` and `Promise.then`? When does each queue drain?',
        'Why is `fs.readFileSync` fine in a CLI script but bad inside an HTTP request handler?',
        'What is libuv and what does its thread pool handle?',
        'How do you start a script with the inspector (`--inspect`) and attach Chrome DevTools or VS Code?',
      ],
    },
    {
      id: 'w01-event-loop-order',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: predict the event loop order',
      summary: 'Write down the output on paper first, then run it.',
      estimateH: 1,
      description: `Save this as \`order.cjs\`. **Before running it**, write down the order in which the lines will be printed and explain each position.

~~~js
const fs = require('node:fs');
console.log('1 sync start');
setTimeout(() => console.log('2 timeout'), 0);
setImmediate(() => console.log('3 immediate'));
process.nextTick(() => console.log('4 nextTick'));
Promise.resolve().then(() => console.log('5 promise'));
fs.readFile(__filename, () => {
  console.log('6 readFile callback');
  setTimeout(() => console.log('7 timeout inside I/O'), 0);
  setImmediate(() => console.log('8 immediate inside I/O'));
  process.nextTick(() => console.log('9 nextTick inside I/O'));
});
console.log('10 sync end');
~~~

Then copy it to \`order.mjs\` (use \`import fs from 'node:fs'\` and \`import.meta.filename\`) and run it again. Something changes. Find out why.`,
      run: 'node order.cjs\nfor i in 1 2 3 4 5; do node order.cjs | head -6 | tail -2; done\nnode order.mjs',
      expected: `1 sync start
10 sync end
4 nextTick
5 promise
2 timeout        ← these two can swap between runs!
3 immediate      ←
6 readFile callback
9 nextTick inside I/O
8 immediate inside I/O   ← always before 7 inside an I/O callback
7 timeout inside I/O`,
      acceptance: [
        'You can explain why `2`/`3` are non-deterministic in the main module but `8` always comes before `7`',
        'You can explain why `5 promise` prints **before** `4 nextTick` in the `.mjs` version (ESM top-level code runs as a microtask)',
      ],
      hints: [
        "In the main module the timer's 1ms threshold may or may not have elapsed when the loop enters the timers phase.",
        "After the poll phase (where I/O callbacks run) comes the check phase (`setImmediate`), and only then the next loop iteration's timers.",
      ],
    },
    {
      id: 'w01-modules-fs-read',
      kind: 'read',
      title: 'Modules, file system and CLI APIs',
      summary: 'CommonJS vs ESM, fs/promises, process.argv and the CLI.',
      estimateH: 3,
      resources: [
        { title: 'Lecture: Modules in Node.js', url: 'https://www.youtube.com/watch?v=RXFOAqsWzFA', lang: 'RU' },
        { title: 'CommonJS modules', url: nodeApi('modules') },
        { title: 'ECMAScript modules', url: nodeApi('esm') },
        { title: 'Packages (package.json "type", "exports")', url: nodeApi('packages') },
        { title: 'module API', url: nodeApi('module') },
        { title: 'File system API', url: nodeApi('fs') },
        { title: 'process.argv & process', url: nodeApi('process', 'processargv') },
        { title: 'Command-line API', url: nodeApi('cli') },
        { title: 'Readline', url: nodeApi('readline') },
      ],
      questions: [
        'How does Node decide whether a `.js` file is CommonJS or ESM?',
        'What replaces `__dirname` in ESM? (`import.meta.dirname` / `import.meta.filename`)',
        'What does `await import(path)` return, and how do you import a file path (hint: `pathToFileURL`)?',
        'Difference between `fs.readdir(dir, { recursive: true })`, `withFileTypes: true` and walking the tree yourself?',
        'How do you check that a path exists without a race condition (`access` vs just trying and catching `ENOENT`)?',
      ],
    },
    {
      id: PROJECT,
      kind: 'project',
      title: 'Project: Node.js Fundamentals',
      summary:
        'Standalone exercises on core APIs: fs, CLI, modules, hash, streams, zlib, worker threads, child processes.',
      estimateH: 1,
      ...assignment('01-nodejs-fundamentals'),
      starterRepo: 'https://github.com/AlreadyBored/node-nodejs-fundamentals',
      maxScore: 200,
      overview: `Fork the starter repository and implement the pre-created functions. Each subtask is a separate file in a subfolder of \`src/\` and is checked on its own. The npm scripts in \`package.json\` run each one.

This plan splits it over **weeks 1–2**. Week 1 covers \`fs\`, \`cli\` and \`modules\`. Week 2 covers \`hash\`, \`streams\`, \`zip\`, \`wt\` and \`cp\`.`,
      requirements: [
        'Any external tools and libraries are **prohibited** (−95% if used)',
        'Node.js 24.x (24.10.0 or upper)',
        "Don't change the signature of pre-written functions (don't rename them, don't make them synchronous)",
        'Prefer asynchronous APIs whenever possible',
      ],
      spec: `### File System (\`src/fs\`)
| File | What it does |
|---|---|
| \`snapshot.js\` | Recursively scan \`workspace\`, write \`snapshot.json\` next to it: \`{ rootPath, entries: [{ path, type, size?, content? }] }\` — paths relative, file content base64 |
| \`restore.js\` | Read \`snapshot.json\`, recreate the tree inside \`workspace_restored\` |
| \`findByExt.js\` | Print files with \`--ext <ext>\` (default \`.txt\`) recursively, relative paths, sorted |
| \`merge.js\` | Concatenate \`workspace/parts/*.txt\` (alphabetical) or \`--files a,b,c\` into \`workspace/merged.txt\` |

Errors: \`Error('FS operation failed')\` when the source is missing (and for \`restore\` when the destination already exists).

### CLI (\`src/cli\`)
- \`interactive.js\` — readline prompt \`> \` with \`uptime\`, \`cwd\`, \`date\`, \`exit\`; \`Unknown command\`; \`Goodbye!\` on exit/Ctrl+C
- \`progress.js\` — in-place progress bar \`[████      ] 67%\`, options \`--duration\`, \`--interval\`, \`--length\`, \`--color #RRGGBB\`

### Modules (\`src/modules\`)
- \`dynamic.js\` — dynamically import \`plugins/<name>.js\`, call \`run()\`, print result; \`Plugin not found\` + exit code 1

### Hash (\`src/hash\`)
- \`verify.js\` — read \`checksums.json\`, compute SHA256 of each file **with streams**, print \`file — OK\` / \`file — FAIL\`

### Streams (\`src/streams\`)
- \`lineNumberer.js\` — stdin → Transform adds \`N | \` → stdout
- \`filter.js\` — stdin → Transform keeps lines containing \`--pattern\` → stdout
- \`split.js\` — \`source.txt\` → \`chunk_1.txt\`, \`chunk_2.txt\`… with at most \`--lines N\` (default 10)

### Zlib (\`src/zip\`)
- \`compressDir.js\` — pack \`workspace/toCompress/\` (whole tree) into one \`workspace/compressed/archive.br\`
- \`decompressDir.js\` — unpack it into \`workspace/decompressed/\`, identical to the original

### Worker Threads (\`src/wt\`)
- \`worker.js\` — receive numbers, sort, send back
- \`main.js\` — read \`data.json\`, split into N = CPU cores chunks, one worker each, **k-way merge** results, log the sorted array

### Child Processes (\`src/cp\`)
- \`execCommand.js\` — \`spawn\` the command from argv, pipe stdout/stderr, pass env, exit with the child's code`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** snapshot.js · **+10** restore.js · **+6** findByExt.js · **+6** merge.js',
            '**+10** interactive.js · **+10** progress.js · **+6** progress.js `--color`',
            '**+10** dynamic.js',
            '**+12** verify.js',
            '**+10** lineNumberer.js · **+10** filter.js · **+10** split.js',
            '**+10** compressDir.js · **+10** decompressDir.js',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+10** worker.js · **+30** main.js (split by CPU count, k-way merge)',
            '**+10** execCommand spawns · **+10** pipes stdout/stderr · **+10** same exit code',
          ],
        },
        { scope: 'Forfeits', items: ['**−95%** any external tools/libraries', '**−30%** commits after deadline'] },
      ],
      deliverables: [
        'Your fork of `node-nodejs-fundamentals` with all files implemented',
        'Every npm script runs without errors',
      ],
    },
    {
      id: 'w01-fs-snapshot',
      kind: 'code',
      title: 'fs: snapshot.js',
      summary: 'Recursively serialize a directory tree into JSON with base64 file contents.',
      estimateH: 2,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/fs/snapshot.js\`. It recursively scans \`workspace\` and writes \`snapshot.json\` **next to** the \`workspace\` folder:

~~~json
{
  "rootPath": "/abs/path/workspace",
  "entries": [
    { "path": "file1.txt", "type": "file", "size": 1024, "content": "<base64>" },
    { "path": "subdir", "type": "directory" },
    { "path": "subdir/nested.txt", "type": "file", "size": 512, "content": "<base64>" }
  ]
}
~~~

- \`path\` is relative to \`workspace\`. Use \`/\` as the separator so the snapshot is portable.
- \`size\` is in bytes and only present for files.
- If \`workspace\` doesn't exist, throw \`new Error('FS operation failed')\`.`,
      run: 'node src/fs/snapshot.js && cat snapshot.json | head -20',
      acceptance: [
        'Nested directories appear as their own `directory` entries',
        'Decoding `content` from base64 gives the original bytes (try a binary file too)',
        'Missing `workspace` → `FS operation failed`',
      ],
      hints: [
        '`readdir(dir, { withFileTypes: true })` tells you which entries are directories without an extra `stat`.',
        '`path.relative(root, full).split(path.sep).join("/")` gives a portable relative path.',
      ],
    },
    {
      id: 'w01-fs-restore',
      kind: 'code',
      title: 'fs: restore.js',
      summary: 'Recreate a directory tree from snapshot.json.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/fs/restore.js\`. It reads \`snapshot.json\` and recreates every directory and file inside \`workspace_restored\`, decoding the base64 contents.

- \`rootPath\` is metadata only. It must **not** affect where you restore.
- Throw \`FS operation failed\` if \`snapshot.json\` is missing **or** \`workspace_restored\` already exists.`,
      run: 'node src/fs/snapshot.js && node src/fs/restore.js && diff -r workspace workspace_restored && echo IDENTICAL',
      expected: 'IDENTICAL',
      acceptance: [
        '`diff -r` shows no differences',
        'Running restore twice fails the second time with `FS operation failed`',
      ],
      hints: [
        'Create the parent directory with `mkdir(dirname(target), { recursive: true })` before writing a file, so the order of entries does not matter.',
      ],
    },
    {
      id: 'w01-fs-find-by-ext',
      kind: 'code',
      title: 'fs: findByExt.js',
      summary: 'Recursive search by extension, read from a CLI argument.',
      estimateH: 1,
      projectId: PROJECT,
      points: 6,
      description: `Implement \`src/fs/findByExt.js\`. Recursively find all files in \`workspace\` with the extension given by \`--ext <extension>\` (\`--ext txt\` or \`--ext js\`, default \`.txt\`). Print their relative paths **sorted alphabetically**, one per line.

Missing \`workspace\` → \`FS operation failed\`.`,
      run: 'node src/fs/findByExt.js --ext js',
      acceptance: [
        'Works with and without a leading dot (`txt` and `.txt`)',
        'Output is sorted',
        'Default extension is `.txt`',
      ],
    },
    {
      id: 'w01-fs-merge',
      kind: 'code',
      title: 'fs: merge.js',
      summary: 'Concatenate text parts in a given or alphabetical order.',
      estimateH: 1,
      projectId: PROJECT,
      points: 6,
      description: `Implement \`src/fs/merge.js\`, which writes \`workspace/merged.txt\`:

- **Default:** all \`.txt\` files from \`workspace/parts\` in alphabetical order.
- **\`--files a.txt,b.txt\`:** only those files, in the given order. This takes precedence over the default.
- Throw \`FS operation failed\` if \`parts\` is missing, has no \`.txt\` files (default mode), or any requested file is missing.`,
      run: 'node src/fs/merge.js && cat workspace/merged.txt\nnode src/fs/merge.js --files c.txt,a.txt',
      acceptance: ['Both modes work', 'All three error cases throw the right error'],
    },
    {
      id: 'w01-cli-interactive',
      kind: 'code',
      title: 'cli: interactive.js',
      summary: 'A tiny REPL built with readline.',
      estimateH: 1.5,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/cli/interactive.js\` using \`node:readline\`:

| Input | Output |
|---|---|
| \`uptime\` | \`Uptime: 12.34s\` (process uptime) |
| \`cwd\` | current working directory |
| \`date\` | current date/time in ISO format |
| \`exit\` | \`Goodbye!\` and exit |
| anything else | \`Unknown command\` |

Show the prompt \`> \`. **Ctrl+C** and end of input (Ctrl+D, or piped stdin) also print \`Goodbye!\` and exit.`,
      run: 'node src/cli/interactive.js\nprintf "cwd\\nfoo\\n" | node src/cli/interactive.js',
      acceptance: ['All 4 commands work', 'Ctrl+C prints Goodbye!', 'Piped input ends with Goodbye!'],
      hints: [
        '`rl.on("close", …)` fires for Ctrl+D and the end of piped input. `rl.on("SIGINT", …)` fires for Ctrl+C.',
      ],
    },
    {
      id: 'w01-cli-progress',
      kind: 'code',
      title: 'cli: progress.js (+ color)',
      summary: 'In-place terminal progress bar with options and ANSI color.',
      estimateH: 2,
      projectId: PROJECT,
      points: 16,
      description: `Implement \`src/cli/progress.js\`. A bar goes from 0% to 100%, redrawn in place with \`\\r\`:

~~~
[████████████████████          ] 67%
Done!
~~~

Options: \`--duration\` (ms, default 5000), \`--interval\` (ms, default 100), \`--length\` (chars, default 30), \`--color #RRGGBB\` (optional).

Color (+6 pts): color **only the filled part** using a 24-bit ANSI sequence \`\\x1b[38;2;R;G;Bm\` and reset with \`\\x1b[0m\` right after it. An invalid color means no color. Don't throw.`,
      run: 'node src/cli/progress.js --duration 3000 --color "#5fa04e"',
      acceptance: [
        'Bar updates on one line',
        'Ends with `Done!` on a new line',
        "Invalid `--color` renders without color and doesn't crash",
      ],
      hints: ['Parse hex with `/^#([0-9a-f]{6})$/i` and `parseInt(hex.slice(i, i + 2), 16)`.'],
    },
    {
      id: 'w01-modules-dynamic',
      kind: 'code',
      title: 'modules: dynamic.js',
      summary: 'Load a plugin by name with dynamic import().',
      estimateH: 1,
      projectId: PROJECT,
      points: 10,
      description: `Implement \`src/modules/dynamic.js\`. It takes a plugin name from the command line, dynamically imports \`plugins/<name>.js\` (\`uppercase\`, \`reverse\`, \`repeat\` already exist), calls its \`run()\` and prints the result.

If the plugin doesn't exist, print \`Plugin not found\` and exit with code **1**.`,
      run: 'node src/modules/dynamic.js uppercase\nnode src/modules/dynamic.js nope; echo "exit code: $?"',
      expected: '…plugin output…\nPlugin not found\nexit code: 1',
      acceptance: ['All 3 plugins work', 'Unknown plugin → message + exit code 1'],
      hints: [
        'Resolve the path relative to the current file: `` new URL(`./plugins/${name}.js`, import.meta.url) ``, and catch `ERR_MODULE_NOT_FOUND`.',
      ],
    },
  ],
};
