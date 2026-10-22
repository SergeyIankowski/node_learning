import type { QuizQuestion } from '../types';
import { adv, basic, mid } from './q';

export const quizzes05to08: Record<string, QuizQuestion[]> = {
  'w05-network-read': [
    basic(
      "What does TCP guarantee that UDP doesn't?",
      [
        'Lower latency',
        '*Reliable, ordered delivery with retransmission of lost packets',
        'Encryption',
        'Broadcasting to many hosts',
      ],
      'TCP is connection-oriented and reliable. UDP just sends datagrams with no delivery or ordering guarantees.',
    ),
    basic(
      'Which protocol is **typically carried over UDP**?',
      ['HTTP/1.1', 'SSH', '*DNS queries', 'SMTP'],
      "Small request/response exchanges like DNS don't need a connection setup. Real-time media also prefers UDP.",
    ),
    basic(
      'What are the steps of the TCP three-way handshake?',
      ['*SYN → SYN-ACK → ACK', 'HELLO → OK → READY', 'ACK → SYN → FIN', 'GET → 200 → CLOSE'],
      'Both sides agree on initial sequence numbers before any data flows.',
    ),
    basic(
      'How long is an IPv6 address?',
      ['32 bits', '64 bits', '*128 bits', '256 bits'],
      'IPv4 has 32 bits (~4.3 billion addresses). IPv6 has 128 bits.',
    ),
    mid(
      'In `https://user@api.example.com:8443/v1/items?id=5#top`, what is the **authority**?',
      ['`api.example.com`', '`/v1/items`', '`https://api.example.com`', '*`user@api.example.com:8443`'],
      'authority = [userinfo@]host[:port]. The path is `/v1/items`, the query is `id=5` and the fragment is `top`.',
    ),
    mid(
      'Is the fragment (`#top`) sent to the server in an HTTP request?',
      ['Yes, as part of the path', 'Yes, in a header', '*No, it is only used by the client', 'Only over HTTPS'],
      'Browsers strip the fragment before sending the request.',
    ),
    mid(
      'Which protocols run **on top of TCP**?',
      ['*HTTP/1.1', '*HTTP/2', '*WebSocket', 'QUIC (used by HTTP/3)'],
      'QUIC runs over UDP and builds its own reliability, which avoids TCP head-of-line blocking.',
    ),
    mid(
      'What identifies a specific application (a listening server) on a host?',
      ['The MAC address', '*The port number', 'The hostname', 'The TTL'],
      'An IP address + port + protocol identifies a socket endpoint, for example `127.0.0.1:4000/tcp`.',
    ),
    adv(
      'What is TCP **head-of-line blocking**?',
      [
        'The first request on a connection is always slow',
        '*One lost packet delays all later data on that connection until it is retransmitted, even data for unrelated HTTP/2 streams',
        'Servers can only accept one connection at a time',
        'Large headers block the body',
      ],
      'HTTP/2 multiplexes streams over one TCP connection, so a lost packet stalls all of them. That is why HTTP/3 moved to QUIC over UDP.',
    ),
    adv(
      'What is `encodeURIComponent("a b&c")`?',
      ['`a+b&c`', '`a%20b&c`', '*`a%20b%26c`', '`a b%26c`'],
      'It percent-encodes everything with special meaning in a URI component, including `&`. Use it (or `URLSearchParams`) when building query strings.',
    ),
    adv(
      'Which default ports are correct?',
      ['*HTTP 80, HTTPS 443', 'HTTP 8080, HTTPS 8443', 'HTTP 443, HTTPS 80', 'HTTP 21, HTTPS 22'],
      '8080 and 8443 are common alternatives in development, not defaults.',
    ),
  ],

  'w05-http-read': [
    basic(
      'Which method is **idempotent but not safe**?',
      ['GET', 'POST', '*PUT', 'HEAD'],
      "Safe methods don't change server state. Idempotent methods have the same effect when repeated. PUT changes state, but doing it twice gives the same result.",
    ),
    basic(
      'Which status code means "resource created"?',
      ['200', '*201', '204', '202'],
      '201 Created, usually with the new resource in the body and/or a `Location` header.',
    ),
    basic(
      'What does **204 No Content** mean?',
      [
        "The resource doesn't exist",
        '*Success, and the response has no body',
        'The request has no body',
        'Try again later',
      ],
      'Typical for successful DELETE.',
    ),
    basic(
      'Which header tells the client the body is JSON?',
      [
        '`Accept: application/json`',
        '*`Content-Type: application/json`',
        '`Content-Encoding: json`',
        '`X-Format: json`',
      ],
      '`Content-Type` describes the body being sent. `Accept` is what the client asks to receive.',
    ),
    mid(
      'What does **multiplexing** mean in HTTP/2?',
      [
        'Several servers answer one request',
        'Requests are retried automatically',
        'Headers are sent in plain text',
        '*Many concurrent requests and responses share one TCP connection as interleaved streams',
      ],
      'In HTTP/1.1, a connection carries one request at a time.',
    ),
    mid(
      'When is **422** more appropriate than 400?',
      [
        '*The body is well-formed, but semantically invalid (for example it references a non-existent article)',
        "The JSON can't be parsed",
        "The route doesn't exist",
        "The user isn't logged in",
      ],
      '400 is for malformed or invalid requests. 422 means "I understood it, but can\'t process it".',
    ),
    mid(
      'How do you read a JSON body with the raw `node:http` module?',
      [
        '`req.body`',
        '`await req.json()`',
        '*`req` is a Readable stream: collect the chunks, concatenate, then `JSON.parse`',
        'Through the `"request"` event argument',
      ],
      '`req.body` only exists with framework middleware. Raw `IncomingMessage` is a stream. (`for await (const c of req)` works well.)',
    ),
    mid(
      'Which methods are **safe**?',
      ['*GET', '*HEAD', '*OPTIONS', 'POST', 'DELETE'],
      'Safe methods must not change server state, so caches and crawlers can call them freely.',
    ),
    adv(
      'What is the difference between **401** and **403**?',
      [
        'They are interchangeable',
        '*401 means not authenticated (missing or invalid credentials); 403 means authenticated but not allowed',
        '401 is for APIs, 403 for websites',
        '403 means the token expired',
      ],
      "Week 13's auth assignment depends on exactly this distinction.",
    ),
    adv(
      'What is HPACK?',
      [
        'A TLS cipher',
        'A JSON compressor',
        '*HTTP/2 header compression, using static and dynamic tables',
        'A packaging format for HTTP archives',
      ],
      'Repeated headers (cookies, user-agent) are sent as small table references instead of full strings.',
    ),
    adv(
      'A Node `http` handler never calls `res.end()`. What happens?',
      [
        'Node ends the response automatically after the handler returns',
        '*The client hangs until a timeout; the socket stays open',
        'Node sends 500',
        'The process crashes',
      ],
      'Every code path, including errors, must end the response. Frameworks do this for you.',
    ),
  ],

  'w05-ts-read': [
    basic(
      'What does `"strict": true` do in `tsconfig.json`?',
      [
        'Runs code in JS strict mode only',
        '*Turns on a family of strict checks such as `strictNullChecks` and `noImplicitAny`',
        'Forbids `any` entirely',
        'Makes the compiler stop on warnings',
      ],
      'Always use strict mode in new projects.',
    ),
    basic(
      'What is the difference between `unknown` and `any`?',
      [
        'None',
        '*A value of type `unknown` must be narrowed before use; `any` disables checking',
        '`any` is safer',
        '`unknown` only works for strings',
      ],
      'Use `unknown` for untrusted input (parsed JSON, catch variables), then validate it.',
    ),
    basic(
      'Which is true about `interface` vs `type`?',
      [
        'Interfaces can describe unions',
        'Types can be declaration-merged',
        'Only interfaces exist at runtime',
        '*Only interfaces support declaration merging; only type aliases can name unions directly',
      ],
      'For object shapes either works. Pick one convention and stay consistent.',
    ),
    basic(
      'How do `tsx` and `tsc` differ?',
      [
        '`tsx` type-checks more strictly',
        '`tsc` runs code directly',
        '*`tsx` transpiles and runs on the fly without type-checking; `tsc` type-checks and emits JavaScript',
        'They are the same tool',
      ],
      'Use tsx for dev speed, and run `tsc --noEmit` in CI to catch type errors.',
    ),
    mid(
      'Why is `r.data` allowed inside the `if`?\n\n~~~ts\ntype R = { ok: true; data: string } | { ok: false; error: Error };\nfunction f(r: R) {\n  if (r.ok) return r.data;\n  return r.error.message;\n}\n~~~',
      [
        'Because `data` is optional',
        '*`ok` is a literal discriminant, so checking it narrows `r` to the matching union member',
        'TypeScript skips checks inside `if`',
        'Because of `strict` mode',
      ],
      'This is a discriminated union, a good fit for validation results.',
    ),
    mid(
      'What does `as const` do to `["admin", "editor"]`?',
      [
        'Freezes the array at runtime',
        '*Infers a readonly tuple of literal types `readonly ["admin", "editor"]`',
        'Converts it to an enum',
        'Nothing in TS files',
      ],
      '`as const` only affects types. Use `Object.freeze` if you need runtime immutability.',
    ),
    mid(
      'Which of these are **erased** at runtime?',
      ['*Interfaces', '*Type aliases', '*Type annotations', 'Regular (non-const) enums'],
      'Enums compile to real objects. That is one reason class-validator DTOs must be classes, not interfaces.',
    ),
    mid(
      'What is `Partial<User>`?',
      [
        '*`User` with every property optional',
        'A random subset of `User` properties',
        '`User` without methods',
        'A readonly `User`',
      ],
      'Typical for update DTOs (`PartialType` in Nest is the class-based equivalent).',
    ),
    adv(
      'What is `Role`?\n\n~~~ts\nconst roles = ["admin", "editor"] as const;\ntype Role = (typeof roles)[number];\n~~~',
      ['`string`', '`string[]`', '*`"admin" | "editor"`', '`number`'],
      'Indexing a tuple type by `number` gives the union of its element types. This keeps runtime values and types in one place.',
    ),
    adv(
      "What does Node 24's built-in TypeScript support do?",
      [
        'Fully compiles TS, including type checking',
        '*Strips type annotations and runs the code without type checking; syntax that needs transformation (such as enums) is unsupported by default',
        'Only works for `.d.ts` files',
        'Requires `tsconfig.json`',
      ],
      'Type stripping is fast but checks nothing. You still need `tsc` for type checking.',
    ),
    adv(
      'What does the `satisfies` operator do?',
      [
        'Casts a value to a type',
        '*Checks that a value matches a type while keeping its own, more precise inferred type',
        'Defines a runtime validator',
        'Makes properties required',
      ],
      'For example `const config = {...} satisfies Config` catches typos but keeps literal types.',
    ),
  ],

  'w06-cluster-read': [
    basic(
      'Do cluster workers share JavaScript memory?',
      [
        'Yes, all variables are shared',
        'Only global variables',
        '*No, each worker is a separate process with its own memory',
        'Only when using SharedArrayBuffer',
      ],
      'An in-memory "database" in each worker diverges. You need IPC to the primary or an external store.',
    ),
    basic(
      'How do the primary and a cluster worker exchange messages?',
      [
        '*`worker.send(msg)` and `process.on("message")` in the worker; `process.send(msg)` back',
        'Shared files',
        'HTTP between them only',
        'Global variables',
      ],
      'Cluster workers are forked processes with an IPC channel.',
    ),
    basic(
      'What is **round-robin** load balancing?',
      [
        'The least busy worker gets the request',
        'A random worker',
        'The fastest worker',
        '*Requests go to the workers one after another in a cycle',
      ],
      '1 → 2 → 3 → 1 → … Simple and fair when requests are similar.',
    ),
    basic(
      'What is `cluster.isPrimary` in the process started with `node app.js`?',
      ['*`true`', '`false`', '`undefined`', 'It depends on the CPU count'],
      'The first process is the primary. Processes created by `cluster.fork()` have `isPrimary === false`.',
    ),
    mid(
      'How does a load balancer forward a request with plain `http.request`?',
      [
        'Call `res.redirect()` to the worker URL',
        "*Create a request to the worker with the same method, path and headers, pipe `req` into it, then copy the status and headers and pipe the worker's response into `res`",
        'Copy only `req.url`',
        'Use `worker.send(req)`',
      ],
      'Streaming both directions also handles large bodies without buffering.',
    ),
    mid(
      'What does `fastify.inject()` do?',
      [
        '*It runs a simulated HTTP request through the app in-process, without opening a port',
        'It injects dependencies',
        'It sends a real request over the network',
        'It adds a route',
      ],
      'This makes API tests fast and isolated.',
    ),
    mid(
      'Why keep workers **stateless**, with state in a shared store?',
      [
        '*Any worker can serve any request',
        '*Workers can crash or restart without losing data',
        '*More instances or machines can be added',
        'Each request becomes faster',
      ],
      "Statelessness enables horizontal scaling. It doesn't speed up a single request.",
    ),
    mid(
      'Why does the assignment start `availableParallelism() − 1` workers?',
      [
        "Node can't use all cores",
        '*To leave a core for the primary process running the load balancer',
        'The last core is reserved for the OS kernel',
        'Odd numbers balance better',
      ],
      'The primary does real work here: proxying every request.',
    ),
    adv(
      "How does Node's **built-in** cluster distribute connections on Linux by default?",
      [
        'The OS kernel picks randomly',
        '*The primary accepts connections and hands them to workers round-robin (except on Windows)',
        'Workers compete with no balancing',
        'It always uses the least-connections algorithm',
      ],
      'The assignment asks for your **own** balancer on a separate port, so the mechanism is visible.',
    ),
    adv(
      'A worker crashes. How should the primary react?',
      [
        'Exit too',
        '*Listen for `cluster.on("exit")`, log it, and fork a replacement',
        'Ignore it',
        'Restart the whole machine',
      ],
      'A self-healing primary is the core idea behind process managers like pm2.',
    ),
    adv(
      'Workers ask the primary for data over IPC. How do you match each reply to its request?',
      [
        'Replies always arrive in order',
        '*Send a unique `requestId` with each message and keep a `Map<requestId, resolve>` of pending promises',
        'Use one IPC channel per request',
        'Use timestamps',
      ],
      'Concurrent requests can be answered out of order. Correlation ids keep them straight.',
    ),
  ],

  'w07-ws-read': [
    basic(
      'Which status code does a server send to accept a WebSocket upgrade?',
      ['200', '*101 Switching Protocols', '426', '302'],
      'After the 101, the TCP connection carries WebSocket frames instead of HTTP.',
    ),
    basic(
      'What is the URL scheme for **TLS-encrypted** WebSockets?',
      ['`ws://`', '*`wss://`', '`https://`', '`wst://`'],
      '`wss://` is to `ws://` what `https://` is to `http://`.',
    ),
    basic(
      'What does "full-duplex" mean for WebSocket?',
      [
        'Two TCP connections are used',
        'Only the client can start messages',
        '*Both sides can send messages at any time over the same connection',
        'Messages are always duplicated',
      ],
      'That is the key difference from request/response HTTP.',
    ),
    basic(
      'How do you send an object with `ws`?',
      [
        '`ws.send(obj)`, which serializes automatically',
        '*`ws.send(JSON.stringify(obj))`',
        '`ws.write(obj)`',
        '`ws.emit("message", obj)`',
      ],
      '`send` accepts strings and binary data. The quiz protocol even double-encodes: `data` is itself a JSON string.',
    ),
    mid(
      'When is **Server-Sent Events** a better fit than WebSocket?',
      [
        'When the client sends a lot of data',
        'For binary data',
        '*For one-way server → client updates over plain HTTP, such as notifications or live feeds',
        'Never',
      ],
      'SSE reconnects automatically and works with ordinary HTTP infrastructure.',
    ),
    mid(
      'How do you broadcast to everyone with `ws`?',
      [
        '`wss.broadcast(msg)`',
        '*Iterate `wss.clients` and send to each client whose `readyState === WebSocket.OPEN`',
        '`ws.send(msg, { all: true })`',
        'Send once and the server copies it',
      ],
      '`ws` has no built-in broadcast or rooms. You build them.',
    ),
    mid(
      "Which headers are part of the client's upgrade request?",
      [
        '*`Upgrade: websocket`',
        '*`Connection: Upgrade`',
        '*`Sec-WebSocket-Key`',
        '`Content-Length: 0`, which is required',
      ],
      'The handshake is an ordinary HTTP GET with these headers.',
    ),
    mid(
      'How do you implement "rooms" (games) with `ws`?',
      [
        '`ws.join(room)`',
        '*Keep your own `Map<roomId, Set<WebSocket>>` and send only to sockets in that set',
        'Open one WebSocket server per room',
        'Use URL paths',
      ],
      "For the quiz, the room is the `Game`: the host plus the players' sockets.",
    ),
    adv(
      'How do you detect connections that died without a close frame?',
      [
        'They always emit `"close"` immediately',
        "*Heartbeat: `ping` regularly, mark `isAlive` on `pong`, and `terminate()` sockets that didn't answer",
        'Check `ws.readyState` once',
        'Set a TCP timeout of 0',
      ],
      'Without a heartbeat, half-open TCP connections can linger for a long time.',
    ),
    adv(
      'What is `Sec-WebSocket-Accept` for?',
      [
        'Authenticating the user',
        'Encrypting frames',
        '*Proving the server understood the WebSocket handshake: base64(SHA-1(key + a fixed GUID))',
        'Choosing a subprotocol',
      ],
      'It is not a security feature. Authenticate users separately, for example with a token.',
    ),
    adv(
      "A slow client can't keep up with your messages. What should you watch?",
      [
        '`ws.readyState`',
        '*`ws.bufferedAmount`: bytes queued but not yet sent',
        '`wss.clients.size`',
        'Nothing, ws drops messages automatically',
      ],
      'If `bufferedAmount` keeps growing, throttle or drop non-essential messages to protect server memory.',
    ),
  ],

  'w08-state-machine-read': [
    basic(
      'What is a finite-state machine?',
      [
        '*A finite set of states plus the transitions between them, triggered by events',
        'A machine with limited memory',
        'A loop that runs a fixed number of times',
        'A database table',
      ],
      'For example `waiting → in_progress → finished`, with explicit rules for each transition.',
    ),
    basic(
      'What happens if you call `clearTimeout` on a timer that already fired?',
      ['It throws', 'The callback runs again', '*Nothing, it is a safe no-op', 'It clears all timers'],
      'So "always clear, then act" is a safe pattern.',
    ),
    basic(
      'Why does the **server** measure answer times?',
      [
        'Servers have more precise clocks',
        '*Clients can lie or have skewed clocks; the server is the source of truth for scoring',
        "Browsers can't measure time",
        'For privacy',
      ],
      'Never trust timestamps from clients when they affect scores.',
    ),
    basic(
      'What does `setTimeout` return in Node.js?',
      [
        'A number, like in browsers',
        '*A `Timeout` object (with `ref`, `unref`, `refresh`)',
        'A Promise',
        '`undefined`',
      ],
      'Store it so you can `clearTimeout` it later.',
    ),
    mid(
      'The timer fires at the same moment the last player answers. How do you avoid two `question_result` messages?',
      [
        'Use a shorter timer',
        'Ignore the last answer',
        '*Make `closeQuestion` idempotent: a closed flag plus `clearTimeout`',
        'Use `setImmediate`',
      ],
      'Node is single-threaded, so the two never run at the same instant. The second call just has to be a no-op.',
    ),
    mid(
      'Why is `performance.now()` better than `Date.now()` for measuring durations?',
      [
        'It returns integers',
        'It is faster to call',
        "*It is monotonic: changes to the system clock (NTP, manual) can't make it jump",
        'It measures CPU time',
      ],
      '`Date.now()` is wall-clock time and can move backwards.',
    ),
    mid(
      'The game status is `waiting`. Which incoming messages should be **rejected**?',
      ['*`answer`', '`join_game`', '*`start_game` from a non-host player', '`start_game` from the host'],
      "Every message has to be checked against the current state **and** the sender's role.",
    ),
    mid(
      'What does `timer.unref()` do?',
      [
        'Cancels the timer',
        "*The timer won't keep the process alive by itself",
        'Fires the timer immediately',
        'Makes the timer repeat',
      ],
      "Useful for housekeeping timers that shouldn't block shutdown.",
    ),
    adv(
      'A finished or abandoned game still has a pending question timer. What can go wrong?',
      [
        'Nothing',
        "*The callback later runs on stale state (for example broadcasting to an empty room), and the game can't be garbage-collected",
        'Node throws on exit',
        'The timer is cleared automatically when players leave',
      ],
      'Clear every timer on every transition into `finished`.',
    ),
    adv(
      'How many results are broadcast if all players answer at 9.999 s?\n\n~~~js\nlet closed = false;\nconst t = setTimeout(close, 10_000);\nfunction close() {\n  if (closed) return;\n  closed = true;\n  clearTimeout(t);\n  broadcastResult();\n}\n// the last answer handler calls close() at 9.999 s\n~~~',
      ['Two', '*One', 'Zero', 'It depends on which runs first'],
      'Whichever runs first sets `closed`, and the second call returns early. `clearTimeout` also prevents the timer firing at all.',
    ),
    adv(
      'When does `setTimeout(cb, 10_000)` fire?',
      [
        'Exactly after 10 000 ms',
        '*No earlier than ~10 s; later if the event loop is busy',
        'Possibly earlier under load',
        'After 10 000 event loop iterations',
      ],
      'Timers are lower bounds. Compute remaining time from timestamps, not from assumed timer precision.',
    ),
  ],
};
