import { assignment, nodeApi, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';

export const DP_PROJECT = 'w03-dp-cli';

export const week03: Week = {
  id: 'w03',
  number: 3,
  programWeek: 2,
  title: 'Data Processing CLI: REPL, navigation & converters',
  short: 'REPL & navigation',
  goals: [
    'Build a persistent REPL with readline that keeps its own working directory',
    'Parse command arguments and resolve paths relative to app state',
    'Convert CSV ⇄ JSON and count words with stream pipelines',
  ],
  modules: [programModule('data-processing-cli', 'Data Processing CLI')],
  tasks: [
    {
      id: 'w03-repl-read',
      kind: 'read',
      title: 'readline, process and path',
      summary: 'Everything you need for an interactive CLI.',
      estimateH: 2,
      resources: [
        { title: 'Readline', url: nodeApi('readline') },
        { title: 'Process', url: nodeApi('process') },
        { title: 'Path', url: nodeApi('path') },
        { title: 'os.homedir()', url: nodeApi('os', 'oshomedir') },
      ],
      questions: [
        'What is the difference between `path.join` and `path.resolve`? What does `resolve(cwd, "/abs")` return?',
        'How do you get the root of the current drive or filesystem in a cross-platform way? (`path.parse(p).root`)',
        'How do you keep a readline loop alive while an async command runs, and print the prompt again afterwards?',
        'Why does the assignment forbid relying on `process.cwd()` for navigation?',
      ],
    },
    {
      id: 'w03-mini-repl',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: mini REPL with async commands',
      summary: 'Two commands, one async, prompt re-shown after each.',
      estimateH: 0.5,
      description: `Write \`mini.mjs\` with \`readline/promises\`. It is a loop that reads a line, splits it into \`command\` and \`args\`, and dispatches through a **map of handlers**:

- \`echo <text>\` prints the text
- \`wait <ms>\` waits that long (async), then prints \`waited\`
- \`.exit\` closes the loop

Use this dispatch-map pattern in the real project instead of a big \`switch\`.`,
      run: 'node mini.mjs',
      acceptance: [
        'The prompt only reappears after the async command finishes',
        'An unknown command prints `Invalid input` and does not crash',
      ],
    },
    {
      id: DP_PROJECT,
      kind: 'project',
      title: 'Project: Data Processing CLI',
      summary:
        'An interactive toolkit: navigation, CSV/JSON, count, hash, AES-GCM encryption and log stats with workers.',
      estimateH: 1,
      ...assignment('02-data-processing-cli'),
      maxScore: 250,
      overview: `A **Data Processing Toolkit**: a persistent Node.js REPL with its own working directory and a set of data-processing commands. Unlike the Fundamentals exercises, everything here lives in one cohesive app.

This plan splits it over **weeks 3–4**. Week 3 covers the REPL, navigation, CSV/JSON and count. Week 4 covers hash, encrypt/decrypt and log-stats.

Create a new repository (for example \`data-processing-cli\`) and start it with \`npm run start\` → \`node src/main.js\`.`,
      requirements: [
        'No external tools or libraries (−95%)',
        'Node.js 24.x (24.10.0+)',
        "All file operations use the **Streams API**. Don't read whole files into memory",
        'Prefer async APIs; the program is an interactive REPL; paths can be relative or absolute',
        ...PR_RULES,
      ],
      spec: `### Behavior
- Start: \`Welcome to Data Processing CLI!\`, then \`You are currently in <home dir>\`, then prompt \`> \`
- After each **successful** operation, print the current directory again
- Unknown command or missing arguments → \`Invalid input\`. A failed operation → \`Operation failed\`. The app keeps running in both cases
- \`.exit\` or Ctrl+C → \`Thank you for using Data Processing CLI!\`
- Keep your **own** cwd variable (start = home dir). Don't use \`process.cwd()\`

### Commands
| Command | Description |
|---|---|
| \`up\` | Go one level up (at the root: do nothing) |
| \`cd <path>\` | Relative or absolute. Not a directory → \`Operation failed\` |
| \`ls\` | Folders first, then files, each group alphabetical: \`name  [folder]\` / \`name  [file]\` |
| \`csv-to-json --input a.csv --output a.json\` | Header row → keys. Readable → Transform → Writable |
| \`json-to-csv --input a.json --output a.csv\` | Array of objects → CSV; headers from the first object's keys |
| \`count --input f.txt\` | \`Lines: N\` / \`Words: N\` / \`Characters: N\` via streams |
| \`hash --input f [--algorithm sha256\\|md5\\|sha512] [--save]\` | Prints \`sha256: <hex>\`. \`--save\` writes \`<file>.<algorithm>\` |
| \`hash-compare --input f --hash f.sha256 [--algorithm …]\` | \`OK\` / \`MISMATCH\` (case-insensitive, trailing newline ignored) |
| \`encrypt --input f --output f.enc --password p\` | AES-256-GCM. File = salt(16) + iv(12) + ciphertext + authTag(16) |
| \`decrypt --input f.enc --output f --password p\` | Verify the auth tag. Failure → \`Operation failed\` |
| \`log-stats --input logs.txt --output stats.json\` | N workers (N = CPU cores) on line-aligned chunks, merged stats |

### log-stats line format
\`<isoTimestamp> <level> <service> <statusCode> <responseTimeMs> <method> <path>\`

Output: \`{ total, levels: {INFO,WARN,ERROR}, status: {"2xx","3xx","4xx","5xx"}, topPaths: [{path,count}], avgResponseTimeMs }\`

### Required structure
~~~
src/main.js  src/repl.js  src/navigation.js
src/commands/{csvToJson,jsonToCsv,count,hash,hashCompare,encrypt,decrypt,logStats}.js
src/workers/logWorker.js
src/utils/{pathResolver,argParser}.js
~~~`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+6** starts with `npm run start` + welcome · **+10** graceful exit · **+6** cwd printed at start and after each op',
            '**+10** `Invalid input` handling · **+10** `Operation failed` handling',
            '**+8** up · **+8** cd · **+12** ls (sorting)',
            '**+20** csv-to-json · **+20** json-to-csv · **+12** count · **+12** hash (+ algorithms, --save)',
            '**+8** encrypt · **+8** decrypt',
            '**+16** all paths resolved relative to app cwd · **+10** errors handled for all file ops',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+28** log-stats (6 chunks by CPU on line boundaries, 10 one worker per chunk, 6 merge, 6 output format)',
            '**+16** project structure follows the spec',
            '**+20** REPL keeps state (cwd) and handles readline correctly',
            '**+10** hash-compare',
          ],
        },
        { scope: 'Forfeits', items: ['**−95%** external tools/libraries', ...PR_FORFEITS] },
      ],
      deliverables: [
        'GitHub repository with the app',
        'PR from the dev branch, with a description that includes your self-score',
      ],
    },
    {
      id: 'w03-repl-shell',
      kind: 'code',
      title: 'REPL shell: welcome, prompt, exit, errors',
      summary: 'main.js + repl.js: the skeleton every command plugs into.',
      estimateH: 2,
      projectId: DP_PROJECT,
      points: 42,
      description: `Create \`src/main.js\` and \`src/repl.js\`:

- \`main.js\` sets up state (\`{ cwd: os.homedir() }\`), prints the welcome message and starts the REPL.
- \`repl.js\` reads a line, parses \`command\` + args, looks up the handler and \`await\`s it, then prints \`You are currently in …\` on success.
- Errors: throw an \`InvalidInputError\` for bad commands or arguments, which prints \`Invalid input\`. **Any** other error prints \`Operation failed\`.
- \`.exit\` and Ctrl+C both print the goodbye message.`,
      run: 'npm run start',
      expected: `Welcome to Data Processing CLI!
You are currently in /Users/you
> foo
Invalid input
> .exit
Thank you for using Data Processing CLI!`,
      acceptance: [
        '`npm run start` runs `node src/main.js`',
        'The app never crashes on bad input',
        'Exits cleanly with both `.exit` and Ctrl+C',
      ],
    },
    {
      id: 'w03-utils',
      kind: 'code',
      title: 'utils: argParser + pathResolver',
      summary: "Parse --flags and resolve paths against the app's cwd.",
      estimateH: 1,
      projectId: DP_PROJECT,
      description: `**\`utils/argParser.js\`**: \`parseArgs(['--input', 'a.csv', '--save'])\` → \`{ input: 'a.csv', save: true }\`. Support quoted paths with spaces if you can (\`--input "my file.txt"\`).

**\`utils/pathResolver.js\`**: \`resolvePath(state.cwd, p)\` → absolute path (\`path.resolve\` handles absolute input).

Add a helper \`requireArgs(args, ['input', 'output'])\` that throws \`InvalidInputError\` when something is missing.`,
      acceptance: [
        'Missing required args → `Invalid input`',
        'Relative paths resolve against the app cwd, not `process.cwd()`',
      ],
      hints: ['Quoted args: tokenize with a regex like `/"([^"]*)"|(\\S+)/g`.'],
    },
    {
      id: 'w03-navigation',
      kind: 'code',
      title: 'navigation: up, cd, ls',
      summary: 'Move around the filesystem from inside the app.',
      estimateH: 1.5,
      projectId: DP_PROJECT,
      points: 28,
      description: `\`src/navigation.js\`:
- \`up\`: \`path.dirname(cwd)\`. At the root it stays where it is.
- \`cd <path>\`: \`stat\` the target, and if it's not a directory → \`Operation failed\`.
- \`ls\`: list folders first, then files, each group alphabetical, aligned:

~~~
folder1    [folder]
file1.txt  [file]
~~~`,
      run: 'npm run start\n> cd ..\n> ls\n> up',
      acceptance: [
        '`cd` works with relative, absolute and `..` paths',
        '`up` at `/` does nothing',
        '`ls` sorting is exactly as specified',
      ],
    },
    {
      id: 'w03-csv-to-json',
      kind: 'code',
      title: 'csv-to-json',
      summary: 'Readable → line-splitting Transform → JSON array writer.',
      estimateH: 2,
      projectId: DP_PROJECT,
      points: 20,
      description: `\`commands/csvToJson.js\`: the first line holds the headers, and every following line becomes an object. Output is a JSON array.

You **must** use a Readable → Transform → Writable pipeline. The Transform emits \`[\` at the start, \`,\` between objects and \`]\` in \`flush\`, so the whole output never sits in memory.

~~~
name,age,city            [
Alice,30,New York   →      { "name": "Alice", "age": "30", "city": "New York" },
Bob,25,London              { "name": "Bob", "age": "25", "city": "London" }
                         ]
~~~`,
      run: 'printf "name,age,city\\nAlice,30,New York\\nBob,25,London\\n" > /tmp/d.csv\n> csv-to-json --input /tmp/d.csv --output /tmp/d.json',
      acceptance: [
        "Output is valid JSON (`node -e \"JSON.parse(require('fs').readFileSync('/tmp/d.json'))\"`)",
        'Handles `\\r\\n` line endings and an empty trailing line',
        'Missing input → `Operation failed`',
      ],
      hints: ['Bonus: handle quoted fields with commas (`"New York, NY"`).'],
    },
    {
      id: 'w03-json-to-csv',
      kind: 'code',
      title: 'json-to-csv',
      summary: 'Buffer and parse JSON, stream CSV out.',
      estimateH: 1,
      projectId: DP_PROJECT,
      points: 20,
      description:
        "`commands/jsonToCsv.js`: input is a JSON array of objects. Headers come from the first object's keys, and each object becomes a row. You may buffer the input to parse it, but **write** the CSV through a stream (for example `Readable.from(generator)` → `createWriteStream`). Invalid JSON → `Operation failed`.",
      run: '> json-to-csv --input /tmp/d.json --output /tmp/back.csv\ndiff /tmp/d.csv /tmp/back.csv',
      acceptance: [
        'Round trip CSV → JSON → CSV gives the same data',
        'Values containing commas or quotes are escaped (`"a, b"`, `""`)',
      ],
    },
    {
      id: 'w03-count',
      kind: 'code',
      title: 'count',
      summary: 'wc -lwc implemented as a stream consumer.',
      estimateH: 1,
      projectId: DP_PROJECT,
      points: 12,
      description:
        '`commands/count.js`: count lines, words (runs of non-whitespace) and characters with streams. Watch out for words split across chunk boundaries.',
      run: '> count --input /usr/share/dict/words',
      expected: 'Lines: 235976\nWords: 235976\nCharacters: 2493885   (macOS dictionary; compare with `wc -l -w -m`)',
      acceptance: [
        'Output format matches exactly',
        'Same numbers as `wc -l -w -m`',
        'A word split across two chunks is counted once',
      ],
      hints: [
        'Use `setEncoding("utf8")` on the read stream so a multi-byte character is never split, and count `char.length` of the decoded strings.',
      ],
    },
  ],
};
