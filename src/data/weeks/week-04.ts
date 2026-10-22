import { nodeApi, programModule } from '../links';
import type { Week } from '../types';
import { DP_PROJECT } from './week-03';

export const week04: Week = {
  id: 'w04',
  number: 4,
  programWeek: 2,
  title: 'Data Processing CLI: hashing, AES-GCM & parallel log stats',
  short: 'Crypto & workers',
  goals: [
    'Hash and compare files with createHash in a stream pipeline',
    'Encrypt and decrypt files with AES-256-GCM end-to-end with streams',
    'Process a large log file in parallel with worker threads and merge partial results',
    'Ship the project with a proper PR',
  ],
  modules: [programModule('data-processing-cli', 'Data Processing CLI')],
  tasks: [
    {
      id: 'w04-crypto-read',
      kind: 'read',
      title: 'Hashes, key derivation and authenticated encryption',
      summary: 'createHash, scrypt, createCipheriv with AES-256-GCM, auth tags.',
      estimateH: 2,
      resources: [
        { title: 'crypto.createHash', url: nodeApi('crypto', 'cryptocreatehashalgorithm-options') },
        {
          title: 'crypto.scrypt (key derivation)',
          url: nodeApi('crypto', 'cryptoscryptpassword-salt-keylen-options-callback'),
        },
        { title: 'crypto.createCipheriv', url: nodeApi('crypto', 'cryptocreatecipherivalgorithm-key-iv-options') },
        { title: 'decipher.setAuthTag', url: nodeApi('crypto', 'deciphersetauthtagbuffer-encoding') },
        {
          title: 'stream.pipeline (promises)',
          url: nodeApi('stream', 'streampipelinesource-transforms-destination-options'),
        },
        { title: 'fs.createReadStream start/end options', url: nodeApi('fs', 'fscreatereadstreampath-options') },
      ],
      questions: [
        'Why must you never use a password directly as an AES key? What do salt and scrypt add?',
        "What does GCM's auth tag protect against? When is it checked during decryption?",
        'Why must the IV be unique for each encryption with the same key?',
        'How can you read "everything except the first 28 and last 16 bytes" of a file as a stream? (`start`/`end` + `stat().size`)',
      ],
    },
    {
      id: 'w04-gcm-roundtrip',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: AES-256-GCM round trip in memory',
      summary: 'Encrypt a string, decrypt it, then tamper with one byte.',
      estimateH: 0.5,
      description: `Write \`gcm.mjs\`:
1. \`salt = randomBytes(16)\`, \`key = scryptSync('secret', salt, 32)\`, \`iv = randomBytes(12)\`
2. Encrypt \`'hello GCM'\` with \`createCipheriv('aes-256-gcm', key, iv)\`, then call \`getAuthTag()\`
3. Decrypt it with the right tag and print the text
4. Flip one bit of the ciphertext and decrypt again. \`final()\` must throw.`,
      run: 'node gcm.mjs',
      expected: 'decrypted: hello GCM\ntampered: Error: Unsupported state or unable to authenticate data',
      acceptance: [
        'You understand that the error only appears at `final()`',
        'You can do the same with the wrong password',
      ],
    },
    {
      id: 'w04-hash',
      kind: 'code',
      title: 'hash (+ --algorithm, --save)',
      summary: 'Stream a file through createHash.',
      estimateH: 1,
      projectId: DP_PROJECT,
      points: 12,
      description:
        '`commands/hash.js`: `pipeline(createReadStream(file), createHash(alg))`, then print `<alg>: <hex>`. Supported algorithms are `sha256` (default), `md5` and `sha512`; anything else → `Operation failed`. With `--save`, write the hex to `<inputFilename>.<algorithm>` next to the input file.',
      run: 'printf hello > notes.txt\n> hash --input notes.txt --algorithm md5 --save\nmd5 notes.txt   # compare (macOS)',
      expected: 'md5: 5d41402abc4b2a76b9719d911017c592',
      acceptance: [
        'Matches `shasum -a 256` / `md5`',
        '`--save` creates `notes.txt.md5`',
        'Unsupported algorithm → `Operation failed`',
      ],
    },
    {
      id: 'w04-hash-compare',
      kind: 'code',
      title: 'hash-compare',
      summary: "Compare a file's hash with a stored value.",
      estimateH: 0.5,
      projectId: DP_PROJECT,
      points: 10,
      description:
        '`commands/hashCompare.js`: compute the hash of `--input`, read the expected value from the `--hash` file, compare case-insensitively after `trim()`, and print `OK` or `MISMATCH`. Reuse the hashing function from `hash.js`.',
      run: '> hash-compare --input notes.txt --hash notes.txt.md5 --algorithm md5',
      expected: 'OK',
      acceptance: [
        'Upper-case hash files work',
        'A trailing newline in the hash file works',
        'A missing file → `Operation failed`',
      ],
    },
    {
      id: 'w04-encrypt',
      kind: 'code',
      title: 'encrypt (AES-256-GCM, streaming)',
      summary: 'salt + iv header, streamed ciphertext, auth tag trailer.',
      estimateH: 1.5,
      projectId: DP_PROJECT,
      points: 8,
      description: `\`commands/encrypt.js\`. Output file layout:

| bytes | content |
|---|---|
| 0–15 | salt |
| 16–27 | iv |
| … | ciphertext |
| last 16 | authTag |

Derive a 32-byte key from the password and salt (\`scrypt\`). Write the 28-byte header first, then pipe input → cipher → output **without ending the output**, then append \`cipher.getAuthTag()\`.`,
      run: '> encrypt --input big.bin --output big.bin.enc --password s3cret',
      acceptance: [
        'Output size = input size + 44 bytes',
        'Only the header and tag are buffered in memory (test with a 1 GB file: memory stays flat)',
      ],
      hints: ['`pipeline(src, cipher, out, { end: false })` keeps `out` open so you can write the tag afterwards.'],
    },
    {
      id: 'w04-decrypt',
      kind: 'code',
      title: 'decrypt (verify the auth tag)',
      summary: 'Read the header and tag, stream the middle through the decipher.',
      estimateH: 1.5,
      projectId: DP_PROJECT,
      points: 8,
      description:
        '`commands/decrypt.js`: `stat` the file to get its size. Read salt and iv from bytes 0–27 and the tag from the last 16 bytes (small ranged reads). `setAuthTag(tag)`, then stream bytes `28 … size−17` through the decipher into the output. A wrong password or a tampered file → `Operation failed`, and delete the partial output.',
      run: '> decrypt --input big.bin.enc --output big.out --password s3cret\ncmp big.bin big.out && echo SAME',
      expected: 'SAME',
      acceptance: [
        'Exactly the original bytes',
        'Wrong password → `Operation failed`',
        'One flipped byte in the file → `Operation failed`',
      ],
    },
    {
      id: 'w04-log-stats',
      kind: 'code',
      title: 'log-stats with worker threads',
      summary: 'Split a 500k-line log by CPU count on line boundaries, aggregate in parallel.',
      estimateH: 3,
      projectId: DP_PROJECT,
      points: 28,
      description: `1. Generate test data: \`node scripts/generate-logs.js --output workspace/logs.txt --lines 500000\`. Copy the generator from the assignment, or write your own using the line format.
2. \`size = stat().size\`. Compute N = CPU cores byte ranges, then move each boundary forward to the next \`\\n\`. Read a few bytes around the boundary to find it.
3. \`workers/logWorker.js\` gets \`{ file, start, end }\`, streams its range and returns **partial** stats: \`{ total, levels, status, paths, responseTimeSum }\`.
4. The main thread merges all partials (sums counters, merges path maps), computes \`topPaths\` (sorted desc) and \`avgResponseTimeMs\` (2 decimals), and writes the JSON.`,
      run: '> log-stats --input workspace/logs.txt --output stats.json\ncat stats.json',
      acceptance: [
        '`total` equals `wc -l`',
        'No line is lost or counted twice at chunk boundaries',
        'Workers = CPU cores',
        'Output keys match the spec',
      ],
    },
    {
      id: 'w04-structure-pr',
      kind: 'code',
      title: 'Project structure, README and PR',
      summary: 'Match the required file layout and git workflow.',
      estimateH: 1,
      projectId: DP_PROJECT,
      points: 16,
      description:
        'Check your tree against the **Required structure** in the project spec. Each command lives in its own file in `src/commands`, and the worker lives in `src/workers`. Write a README with every command and an example. Open the PR from your dev branch with at least 3 meaningful commits.',
      run: 'find src -name "*.js" | sort\ngit log --oneline main..dev',
      acceptance: ['The tree matches the spec', 'README lists all commands', 'PR description has your self-score'],
    },
    {
      id: 'w04-dp-ship',
      kind: 'code',
      title: 'Ship & self-score: Data Processing CLI',
      summary: 'Full manual test session against the score sheet.',
      estimateH: 1,
      projectId: DP_PROJECT,
      description:
        'Run a full session in a fresh terminal, going through every scoring line. Try to break the app: missing args, missing files, paths with spaces, a directory instead of a file, Ctrl+C in the middle of `log-stats`.',
      acceptance: ['Self-score written down (target ≥ 220/250)', 'Zero crashes during the destructive test session'],
    },
  ],
};
