import { programModule } from '../links';
import type { Week } from '../types';
import { QUIZ_PROJECT } from './week-07';

export const week08: Week = {
  id: 'w08',
  number: 8,
  programWeek: 4,
  title: 'WebSocket: game loop, timers & disconnects',
  short: 'Quiz game loop',
  goals: [
    'Drive a state machine with server-side timers',
    'Compute speed-based scores and ranked scoreboards',
    'Handle disconnects without breaking the game',
  ],
  modules: [programModule('websocket', 'Network communication: WebSocket')],
  tasks: [
    {
      id: 'w08-state-machine-read',
      kind: 'read',
      title: 'Timers and state machines for real-time servers',
      summary: 'Model the game as explicit states and transitions before you code it.',
      estimateH: 1,
      resources: [
        { title: 'Finite-state machine', url: 'https://en.wikipedia.org/wiki/Finite-state_machine' },
        {
          title: 'Node.js timers (setTimeout / clearTimeout)',
          url: 'https://nodejs.org/docs/latest-v24.x/api/timers.html',
        },
        {
          title: 'ws: detecting broken connections',
          url: 'https://github.com/websockets/ws#how-to-detect-and-close-broken-connections',
        },
      ],
      questions: [
        'Draw the states of a Game (`waiting → question_open → question_closed → … → finished`). Which messages are valid in each one?',
        'How do you avoid the race "timer fires" vs "last player answers" producing two `question_result` messages?',
        'Why measure time with `performance.now()` / `Date.now()` on the server instead of trusting the client?',
      ],
    },
    {
      id: 'w08-quiz-start',
      kind: 'code',
      title: 'start_game (host only) → first question',
      summary: 'Authorization check and the first broadcast.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        'Only the host of the game may start it, and only while it is `waiting`. Set `status: "in_progress"`, then `askQuestion(game, 0)`, which broadcasts `question` **without** `correctIndex`. Record `questionStartedAt`.',
      acceptance: [
        'A non-host gets an error',
        'Players see the first question',
        'The payload contains no `correctIndex`',
      ],
    },
    {
      id: 'w08-quiz-answer',
      kind: 'code',
      title: 'answer → answer_accepted',
      summary: 'Validate and store exactly one answer per player per question.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        "Accept the answer only if the game is in progress, `questionIndex === currentQuestion`, the question is still open, the player is in the game and hasn't answered yet. Store `{ answerIndex, answeredAt }` and reply `answer_accepted`. If every player has answered → close the question early.",
      acceptance: [
        'A double answer is ignored',
        'Late answers are rejected',
        'Everyone answering closes the question immediately',
      ],
    },
    {
      id: 'w08-quiz-timer',
      kind: 'code',
      title: 'Server timer + question_result',
      summary: 'Close each question after timeLimitSec even if players are silent.',
      estimateH: 1.5,
      projectId: QUIZ_PROJECT,
      points: 32,
      description:
        'In `askQuestion`, start `setTimeout(closeQuestion, timeLimitSec * 1000)`. `closeQuestion` is **idempotent**: it clears the timer, marks the question closed, scores it and broadcasts `question_result` with `correctIndex` and `playerResults` for **all** players (including `answered: false`). Then, after a short pause (say 3 s), it asks the next question or finishes the game.',
      acceptance: [
        'Results arrive after the time limit when nobody answers',
        'There is never more than one `question_result` per question',
      ],
    },
    {
      id: 'w08-quiz-scoring',
      kind: 'code',
      title: 'Speed-based scoring',
      summary: 'basePoints × timeRemaining / timeLimit.',
      estimateH: 0.5,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        '`points = correct ? Math.round(1000 * Math.max(0, limitMs - (answeredAt - startedAt)) / limitMs) : 0`. Put it in a pure function `calcPoints(...)` and write a few quick tests for it (instant answer ≈ 1000, at the deadline = 0, wrong = 0).',
      acceptance: ['Max 1000 per question', 'A faster correct answer gets more points', 'A pure function with tests'],
    },
    {
      id: 'w08-quiz-finish',
      kind: 'code',
      title: 'Full flow → game_finished with ranks',
      summary: 'End-to-end game with a ranked scoreboard.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 26,
      description:
        'After the last `question_result`, set `status: "finished"` and broadcast `game_finished` with the scoreboard sorted by score (desc). Give equal scores the same rank (1, 2, 2, 4). Then play a full game in 3 browser windows (host + 2 players).',
      acceptance: ['Full game works in the template client', 'Ties share a rank'],
    },
    {
      id: 'w08-quiz-disconnect',
      kind: 'code',
      title: 'Disconnect handling',
      summary: 'A player leaving mid-game must not freeze it.',
      estimateH: 1,
      projectId: QUIZ_PROJECT,
      points: 16,
      description:
        'On `ws.on("close")`: remove the player from their game, broadcast `update_players`, and if all remaining players have now answered, close the question. Decide what happens when the **host** leaves (for example, finish the game) and document it.',
      acceptance: [
        "Closing a player tab updates everyone's list",
        'The game continues to the end',
        'No timers keep running for finished or abandoned games',
      ],
    },
    {
      id: 'w08-quiz-ship',
      kind: 'code',
      title: 'Ship & self-score: Live Quiz Game',
      summary: 'Play-test, check the score sheet, open the PR.',
      estimateH: 0.5,
      projectId: QUIZ_PROJECT,
      description:
        'Play at least 2 full games with 3+ clients, including a disconnect in the middle. Go through the score sheet and open the PR with your self-score.',
      acceptance: ['Self-score written down (target ≥ 160/180)'],
    },
  ],
};
