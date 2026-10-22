# Node.js Roadmap

A local study app for the [RS School Node.js course](https://github.com/rolling-scopes-school/tasks/blob/master/node/README.md). Each of the program's 10 weeks is split into two study weeks (20 in total). Every week has theory to read, exercises to code and, where the program has one, a project with its full specification.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
```

| Script              | What it does                                                                          |
| ------------------- | ------------------------------------------------------------------------------------- |
| `npm run dev`       | Dev server                                                                            |
| `npm run build`     | Type-check and build into `dist/`                                                     |
| `npm run preview`   | Serve the production build                                                            |
| `npm test`          | Unit tests: data and test-question integrity, grading, progress store, roadmap layout |
| `npm run plan:md`   | Regenerate [STUDY_PLAN.md](STUDY_PLAN.md) from the app data                           |
| `npm run format`    | Format all files with [Biome](https://biomejs.dev)                                    |
| `npm run lint`      | Lint with Biome                                                                       |
| `npm run check`     | Format check + lint + import order (run this before committing)                       |
| `npm run check:fix` | Apply all safe Biome fixes and formatting                                             |

Formatting rules live in [biome.json](biome.json): 2 spaces, single quotes, semicolons, trailing commas, 120-column lines. With the Biome VS Code extension (recommended in `.vscode/extensions.json`), files are formatted on save.

## Using it

- **Roadmap** (`/`): a pixi.js map of the 20 weeks. Each week node is surrounded by its tasks: ◯ read, ▢ code, ◇ project. Drag to pan, scroll or pinch to zoom, **Fit** to see everything, **Now** to jump to your current week. Click or tap a week or a task to open it. The layout adapts to the screen: 6 columns on wide screens, 4 on portrait tablets, and on phones (either orientation) a single column of program weeks shown at full width that you scroll through.
- **Week** (`/week/w01`): goals, links to the program modules, and the tasks grouped into theory, practice and project.
- **Task** (`/week/w01/task/…`): read tasks list resources and self-check questions, and end with a **test** of 10–12 questions at three depth levels (basic → intermediate → advanced, including multi-select and "predict the output" questions). Options are shuffled on every attempt. Checking shows a score per level, a verdict on how deep your understanding is, and an explanation for every question. Passing needs 80%. Code tasks have the description, run command, expected output, "done when" list and hints. Project tasks have the full app spec, scoring and links to their steps.
- Tick the checkbox to mark a task solved. Progress and test results are saved to `localStorage` under `node-learning-progress` as a plain object (`{ state: { completed: { [taskId]: isoDate }, quizResults: { [taskId]: { best, last, total, attempts, lastByLevel, at } } } }`). **Export** and **Import** in the header back it up as JSON.

## Project layout

```
src/
  data/weeks/week-NN.ts   study content: one file per week (edit here)
  data/quizzes/           theory tests, keyed by read-task id; grading and depth verdict
  data/types.ts           Week / Task model (read | code | project)
  store/progress.ts       zustand store persisted to localStorage
  roadmap/                pure layout, viewport math, pixi canvas
  pages/                  Roadmap, Week, Task pages
  components/ui/          custom UI kit (Button, Checkbox, Card, Badge, ProgressBar, …)
  components/task/        views for each task kind
```

Task ids (for example `w03-csv-to-json`) are the keys for saved progress. Keep them stable when you edit content.
