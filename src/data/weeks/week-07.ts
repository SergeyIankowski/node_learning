import { assignment, PR_FORFEITS, PR_RULES, programModule } from '../links';
import type { Week } from '../types';

export const QUIZ_PROJECT = 'w07-quiz';

export const week07: Week = {
  id: 'w07',
  number: 7,
  programWeek: 4,
  title: 'WebSocket: protocol basics & quiz game lobby',
  short: 'WebSocket lobby',
  goals: [
    'Understand how WebSocket upgrades from HTTP and frames messages',
    'Build a typed message router on top of the `ws` library',
    'Implement registration, game creation and joining with broadcasts',
  ],
  modules: [programModule('websocket', 'Network communication: WebSocket')],
  tasks: [
    {
      id: 'w07-ws-read',
      kind: 'read',
      title: 'Communication protocols and WebSocket',
      summary: 'Full-duplex communication over one TCP connection.',
      estimateH: 2,
      resources: [
        { title: 'Communication protocol', url: 'https://en.wikipedia.org/wiki/Communication_protocol' },
        { title: 'WebSocket', url: 'https://en.wikipedia.org/wiki/WebSocket' },
        { title: 'MDN: The WebSocket API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
        { title: 'ws — Node.js WebSocket library', url: 'https://github.com/websockets/ws' },
      ],
      questions: [
        'What does the HTTP `Upgrade` handshake look like (`101 Switching Protocols`, `Sec-WebSocket-Key`)?',
        'WebSocket vs HTTP long-polling vs Server-Sent Events: when would you pick each?',
        'How do you broadcast to every client in `ws`? To only the clients in one room?',
        'How do you detect dead connections (ping/pong, `isAlive`)?',
      ],
    },
    {
      id: 'w07-ws-chat',
      kind: 'code',
      warmup: true,
      title: 'Warm-up: broadcast chat with ws',
      summary: '30 lines: connect, name yourself, broadcast.',
      estimateH: 1,
      description: `\`npm i ws\`. Write \`chat.mjs\`:
- The first message from a client is its nickname
- Every later message is broadcast to **all other** clients as \`{ from, text, at }\` JSON
- On \`close\`, broadcast \`<nick> left\`

Test with two terminals: \`npx wscat -c ws://localhost:8080\`.`,
      run: 'node chat.mjs\nnpx wscat -c ws://localhost:8080',
      acceptance: [
        'Messages reach the other clients but not the sender',
        'A disconnect is announced',
        "Invalid JSON input doesn't crash the server",
      ],
    },
    {
      id: QUIZ_PROJECT,
      kind: 'project',
      title: 'Project: WebSocket Live Quiz Game',
      summary: 'Backend for a Kahoot-style game: rooms, timed questions, speed-based scoring.',
      estimateH: 1,
      ...assignment('04-websockets'),
      starterRepo: 'https://github.com/AlreadyBored/live-quiz-game-template',
      maxScore: 180,
      overview: `Fork the template. It has a working **React client** (\`client/\`) and a **server stub** (\`server/\`) with TS types. You implement the server logic.

This plan splits it over **weeks 7–8**. Week 7 covers the router, registration, creating and joining. Week 8 covers the game loop, timer, scoring, scoreboard and disconnects.`,
      requirements: [
        'JavaScript or TypeScript; Node.js 24.x (24.10.0+)',
        'Start with `npm run start`. Print the WebSocket address and port on startup',
        'All messages are JSON strings: `{ type, data, id: 0 }`, where **`data` is itself a JSON string**',
        'Use the `ws` library; in-memory storage',
        ...PR_RULES,
      ],
      spec: `### Game flow
1. Players and hosts \`reg\` (login or register) with a name and password
2. The host sends \`create_game\` with questions (4 options, \`correctIndex\`, \`timeLimitSec\`). The server answers \`game_created\` with a **6-char code**
3. Players send \`join_game\` with the code. They get \`game_joined\`. Everyone in the room gets \`player_joined\` and \`update_players\`
4. The host sends \`start_game\` → \`question\` is broadcast (no correct answer!)
5. Players send \`answer\` → they get \`answer_accepted\`
6. The timer expires or everyone has answered → \`question_result\` is broadcast (\`correctIndex\` + per-player results)
7. The next \`question\`… After the last one → \`game_finished\` with \`scoreboard\` and ranks

### Scoring
Correct: \`round(1000 × timeRemaining / timeLimit)\`. Wrong or no answer: 0.

### Data
~~~ts
interface Player { name: string; index: number | string; score: number }
interface Question { text: string; options: string[]; correctIndex: number; timeLimitSec: number }
interface Game {
  id: string; code: string; hostId: number | string;
  questions: Question[]; players: Player[];
  currentQuestion: number; // -1 before start
  status: 'waiting' | 'in_progress' | 'finished';
}
~~~

### Messages (→ server, ← client)
| type | direction | data |
|---|---|---|
| \`reg\` | → | \`{ name, password }\` |
| \`reg\` | ← personal | \`{ name, index, error, errorText }\` |
| \`create_game\` | → | \`{ questions: Question[] }\` |
| \`game_created\` | ← host | \`{ gameId, code }\` |
| \`join_game\` | → | \`{ code }\` |
| \`game_joined\` | ← player | \`{ gameId }\` |
| \`player_joined\` | ← room | \`{ playerName, playerCount }\` |
| \`update_players\` | ← room | \`Player[]\` |
| \`start_game\` | → host only | \`{ gameId }\` |
| \`question\` | ← room | \`{ questionNumber, totalQuestions, text, options, timeLimitSec }\` |
| \`answer\` | → | \`{ gameId, questionIndex, answerIndex }\` |
| \`answer_accepted\` | ← personal | \`{ questionIndex }\` |
| \`question_result\` | ← room | \`{ questionIndex, correctIndex, playerResults: [{ name, answered, correct, pointsEarned, totalScore }] }\` |
| \`game_finished\` | ← room | \`{ scoreboard: [{ name, score, rank }] }\` |

Disconnects: remove the player from the game, broadcast \`update_players\`, and keep the game going.`,
      scoring: [
        {
          scope: 'Basic',
          items: [
            '**+10** server starts and accepts connections',
            '**+16** each: reg · create_game · join_game · start_game · answer · question_result',
          ],
        },
        {
          scope: 'Advanced',
          items: [
            '**+26** full game flow end-to-end',
            '**+16** speed-bonus scoring',
            '**+16** server-side timer',
            '**+16** disconnect handling',
          ],
        },
        { scope: 'Forfeits', items: ['**−95%** libraries beyond the requirements', ...PR_FORFEITS] },
      ],
      deliverables: [
        'Your fork with server logic implemented',
        'PR with self-score; a short screen recording of a full game is a nice bonus',
      ],
    },
    {
      id: 'w07-quiz-router',
      kind: 'code',
      title: 'Server skeleton: message router & send helpers',
      summary: 'Parse the double-encoded JSON once and dispatch by type.',
      estimateH: 1.5,
      projectId: QUIZ_PROJECT,
      points: 10,
      description: `In \`server/\`:
- \`send(ws, type, data)\` → \`ws.send(JSON.stringify({ type, data: JSON.stringify(data), id: 0 }))\`
- \`broadcast(game, type, data)\` sends to the host and every player socket in the room
- \`handlers: Record<string, (ctx, data) => void>\`: parse \`msg.data\` once, then dispatch
- Keep a \`Map<WebSocket, Session>\` for the logged-in user of each connection

Wrap the dispatch in try/catch so a bad message never kills the server.`,
      run: 'npm run start',
      expected: 'WebSocket server is running on ws://localhost:3000',
      acceptance: ['The startup log shows the address', 'Malformed messages are logged and ignored'],
    },
    {
      id: 'w07-quiz-reg',
      kind: 'code',
      title: 'reg: register / login',
      summary: 'Unknown name → register; known name → check password.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        'Store users in a `Map<name, { password, index }>`. A new name registers and responds with `error: false`. An existing name with the right password logs in. A wrong password → `error: true, errorText: "Wrong password"`. Tie the user to the socket session.',
      acceptance: ['The client moves past the login screen', 'A wrong password shows the error text in the client'],
    },
    {
      id: 'w07-quiz-create',
      kind: 'code',
      title: 'create_game: validate questions, generate code',
      summary: 'Unique 6-character alphanumeric room codes.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        'Validate: at least 1 question, each with exactly 4 options, `0 ≤ correctIndex ≤ 3` and `timeLimitSec > 0`. Generate a 6-char code (`[A-Z0-9]`) that is not already in use. Store the game with `status: "waiting"` and `currentQuestion: -1`, then reply `game_created` to the host.',
      acceptance: ['Invalid question sets are rejected with an error message', 'Codes are unique among active games'],
    },
    {
      id: 'w07-quiz-join',
      kind: 'code',
      title: 'join_game + player_joined + update_players',
      summary: 'Room membership and broadcasts.',
      estimateH: 1.5,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        "Find the game by code (case-insensitive). Reject it if it doesn't exist or is not `waiting`. Add the player (score 0), reply `game_joined`, then broadcast `player_joined` and `update_players` to the room. The same user joining twice should not duplicate them.",
      acceptance: ['Two browser windows show each other in the lobby', 'A wrong code gives a clear error'],
    },
  ],
};
