const ASSIGNMENTS = 'https://github.com/AlreadyBored/nodejs-assignments/blob/main/assignments-v2';
const MODULES = 'https://github.com/rolling-scopes-school/tasks/blob/master/node/modules';

/** Assignment + score links. Folder names are the real ones (the program README links some stale names). */
export const assignment = (folder: string) => ({
  assignmentUrl: `${ASSIGNMENTS}/${folder}/assignment.md`,
  scoreUrl: `${ASSIGNMENTS}/${folder}/score.md`,
});

export const programModule = (path: string, title: string) => ({ title, url: `${MODULES}/${path}/README.md` });

/** Node.js 24 API docs page, e.g. `nodeApi('fs')`. */
export const nodeApi = (page: string, anchor = '') =>
  `https://nodejs.org/docs/latest-v24.x/api/${page}.html${anchor ? `#${anchor}` : ''}`;

/** Requirements shared by every RS School assignment that is submitted via a pull request. */
export const PR_RULES = [
  'Work in a separate development branch, open a Pull Request into `main` with a proper description',
  'At least 3 commits in the development branch (not counting commits that only touch `Readme.md`, `.gitignore`, configs)',
  'No commits after the deadline (except Readme/.gitignore) — set yourself a deadline at the end of the week',
];

export const PR_FORFEITS = [
  '**−20** Missing PR or its description is incorrect',
  '**−20** No separate development branch',
  '**−20** Less than 3 commits in the development branch (not counting Readme/config-only commits)',
  '**−30% of total score** Commits after the deadline',
];
