import type { TaskKind, Week } from '../data/types';

/**
 * Column counts the roadmap can be laid out in. Always even, so both halves of a
 * program week share a row: 2 for phones, 4 for portrait tablets, 6 for wide screens.
 */
export const COLUMN_OPTIONS = [2, 4, 6] as const;
export type Columns = (typeof COLUMN_OPTIONS)[number];

/** Below this width or height (phones in either orientation) the roadmap is one tall column of program weeks. */
export const NARROW_WIDTH = 700;
export const SHORT_HEIGHT = 500;

export const LAYOUT = {
  spacingX: 360,
  spacingY: 380,
  weekRadius: 46,
  taskRing: 120,
  taskSize: 11,
  bandPad: 150,
  /** Half-width (rad) of the sector below each week node kept free for its title. */
  titleSector: 1.05,
  /** Width the week title may wrap at so it fits inside the title sector. */
  titleWidth: 160,
} as const;

/** Vertical room reserved above a band for its label. */
export const BAND_LABEL_SPACE = 30;

export type WeekNode = { weekId: string; number: number; x: number; y: number };
export type TaskNode = { taskId: string; weekId: string; kind: TaskKind; x: number; y: number; angle: number };
export type Edge = { fromWeekId: string; toWeekId: string; x1: number; y1: number; x2: number; y2: number };
export type Band = { programWeek: number; label: string; x: number; y: number; w: number; h: number };
export type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

export type RoadmapLayout = {
  weeks: WeekNode[];
  tasks: TaskNode[];
  edges: Edge[];
  bands: Band[];
  bounds: Bounds;
};

/** Grid cell of the i-th week on a serpentine path (left→right, then right→left). */
function cell(i: number, cols: number) {
  const row = Math.floor(i / cols);
  const pos = i % cols;
  const col = row % 2 === 0 ? pos : cols - 1 - pos;
  return { row, col };
}

const angleDist = (a: number, b: number) => {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return Math.min(d, 2 * Math.PI - d);
};

/**
 * Spreads `n` task nodes evenly over the ring, leaving the sector below the week node free
 * for its title. The spread is shifted so nodes stay as far as possible from the connector
 * directions in `blocked`, so lines between weeks don't run through task nodes.
 */
function taskAngles(n: number, blocked: number[]): number[] {
  if (n === 0) return [];
  const start = Math.PI / 2 + LAYOUT.titleSector;
  const arc = 2 * Math.PI - 2 * LAYOUT.titleSector;
  const step = arc / n;
  const at = (t: number) => Array.from({ length: n }, (_, i) => start + (i + t) * step);
  let bestT = 0.5;
  let bestScore = -Infinity;
  for (let k = 0; k <= 40; k++) {
    // Keep a little distance from the sector edges, then maximize distance to connectors.
    const t = 0.15 + (k / 40) * 0.7;
    let score = Infinity;
    for (const a of at(t)) for (const b of blocked) score = Math.min(score, angleDist(a, b));
    if (blocked.length === 0) score = -Math.abs(t - 0.5);
    if (score > bestScore + 1e-9) {
      bestScore = score;
      bestT = t;
    }
  }
  return at(bestT);
}

export function computeLayout(weeks: Week[], cols: Columns = 6): RoadmapLayout {
  const weekNodes: WeekNode[] = weeks.map((w, i) => {
    const { row, col } = cell(i, cols);
    return { weekId: w.id, number: w.number, x: col * LAYOUT.spacingX, y: row * LAYOUT.spacingY };
  });

  const edges: Edge[] = [];
  for (let i = 0; i < weekNodes.length - 1; i++) {
    const a = weekNodes[i];
    const b = weekNodes[i + 1];
    edges.push({ fromWeekId: a.weekId, toWeekId: b.weekId, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  const tasks: TaskNode[] = [];
  weeks.forEach((week, i) => {
    const node = weekNodes[i];
    const blocked: number[] = [];
    const prev = weekNodes[i - 1];
    const next = weekNodes[i + 1];
    if (prev) blocked.push(Math.atan2(prev.y - node.y, prev.x - node.x));
    if (next) blocked.push(Math.atan2(next.y - node.y, next.x - node.x));
    taskAngles(week.tasks.length, blocked).forEach((angle, j) => {
      const task = week.tasks[j];
      tasks.push({
        taskId: task.id,
        weekId: week.id,
        kind: task.kind,
        angle,
        x: node.x + Math.cos(angle) * LAYOUT.taskRing,
        y: node.y + Math.sin(angle) * LAYOUT.taskRing,
      });
    });
  });

  const bands: Band[] = [];
  const byProgramWeek = new Map<number, WeekNode[]>();
  weeks.forEach((w, i) => {
    const list = byProgramWeek.get(w.programWeek) ?? [];
    list.push(weekNodes[i]);
    byProgramWeek.set(w.programWeek, list);
  });
  for (const [programWeek, nodes] of byProgramWeek) {
    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    const first = weeks.find((w) => w.programWeek === programWeek)!;
    const p = LAYOUT.bandPad;
    bands.push({
      programWeek,
      label: `Program week ${programWeek} · ${first.modules.map((m) => m.title).join(' + ')}`,
      x: Math.min(...xs) - p,
      y: Math.min(...ys) - p,
      w: Math.max(...xs) - Math.min(...xs) + 2 * p,
      h: Math.max(...ys) - Math.min(...ys) + 2 * p,
    });
  }

  const bounds: Bounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (const b of bands) {
    bounds.minX = Math.min(bounds.minX, b.x);
    // Band labels are drawn just above each band.
    bounds.minY = Math.min(bounds.minY, b.y - BAND_LABEL_SPACE);
    bounds.maxX = Math.max(bounds.maxX, b.x + b.w);
    bounds.maxY = Math.max(bounds.maxY, b.y + b.h);
  }

  return { weeks: weekNodes, tasks, edges, bands, bounds };
}

/**
 * Picks the column count for a screen. Phone-sized screens (narrow or short) get 2 columns, shown at
 * full width and scrolled vertically. Wider screens get whichever of 4 or 6 columns lets
 * the whole map fit at the largest scale.
 */
export function pickColumns(weeks: Week[], width: number, height: number): Columns {
  if (width < NARROW_WIDTH || height < SHORT_HEIGHT) return 2;
  let best: Columns = 6;
  let bestScale = 0;
  for (const cols of [4, 6] as const) {
    const { bounds } = computeLayout(weeks, cols);
    const scale = Math.min(width / (bounds.maxX - bounds.minX), height / (bounds.maxY - bounds.minY));
    if (scale > bestScale) {
      bestScale = scale;
      best = cols;
    }
  }
  return best;
}
