/** basic = definitions and facts, intermediate = applying them, advanced = edge cases, code output, trade-offs. */
export type QuizLevel = 'basic' | 'intermediate' | 'advanced';

export type QuizQuestion = {
  level: QuizLevel;
  /** Markdown (may contain code blocks). */
  question: string;
  /** Markdown, rendered inline. */
  options: string[];
  /** Indexes of the correct options; more than one means "select all that apply". */
  answers: number[];
  /** Shown after checking: why the answer is right. */
  explanation: string;
};

export type Resource = {
  title: string;
  url: string;
  lang?: 'RU';
};

type TaskBase = {
  /** Stable id, e.g. `w03-csv-to-json`. Progress is keyed by it — never rename. */
  id: string;
  title: string;
  /** One line shown in lists and roadmap tooltips. */
  summary: string;
  estimateH: number;
};

export type ReadTask = TaskBase & {
  kind: 'read';
  resources: Resource[];
  /** Questions you should be able to answer after reading. */
  questions: string[];
};

export type CodeTask = TaskBase & {
  kind: 'code';
  /** Markdown. */
  description: string;
  /** Shell command to run the solution. */
  run?: string;
  /** Expected output (shown as a code block). */
  expected?: string;
  acceptance: string[];
  hints?: string[];
  /** Id of the project task this step belongs to. */
  projectId?: string;
  /** Points of the assignment score this step covers. */
  points?: number;
  warmup?: boolean;
};

export type ScoringScope = 'Basic' | 'Advanced' | 'Hacker' | 'Forfeits';

export type ProjectTask = TaskBase & {
  kind: 'project';
  /** Markdown. */
  overview: string;
  starterRepo?: string;
  assignmentUrl: string;
  scoreUrl: string;
  maxScore?: number;
  requirements: string[];
  /** Markdown: features, API, data models. */
  spec: string;
  scoring: { scope: ScoringScope; items: string[] }[];
  deliverables: string[];
};

export type Task = ReadTask | CodeTask | ProjectTask;
export type TaskKind = Task['kind'];

export type Week = {
  /** `w01` … `w20` */
  id: string;
  number: number;
  /** Week number in the original RS School program (1–10). */
  programWeek: number;
  title: string;
  /** Very short label for the roadmap node. */
  short: string;
  goals: string[];
  modules: { title: string; url: string }[];
  tasks: Task[];
};
