import { Application, Circle, Container, type FederatedPointerEvent, Graphics, Text } from 'pixi.js';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskPath, weekPath } from '../data';
import { KIND_META } from '../data/kinds';
import type { Task, Week } from '../data/types';
import { useProgress, type WeekStatus, weekProgress, weekStatus } from '../store/progress';
import { BAND_LABEL_SPACE, type Columns, computeLayout, LAYOUT, pickColumns, type RoadmapLayout } from './layout';
import styles from './RoadmapCanvas.module.css';
import { applyView, fitView, focusView, type Insets, readView, type ViewState, zoomAt } from './viewport';

const C = {
  bg: '#0f1411',
  band: '#141b17',
  bandBorder: '#222d27',
  bandText: '#7f9187',
  node: '#161d19',
  ringTrack: '#1d2621',
  line: '#3a4a41',
  spoke: '#2a362f',
  text: '#e6eee9',
  muted: '#94a69b',
  done: '#5fa04e',
  active: '#e0a84a',
} as const;

const STATUS_COLOR: Record<WeekStatus, string> = { todo: C.line, active: C.active, done: C.done };
const FONT = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
/** Text is rasterized once, so render it at a resolution that stays sharp when zoomed in on dense screens. */
const TEXT_RESOLUTION = 4;

export type RoadmapControls = {
  /** Shows the whole map. */
  fit: () => void;
  /** Scrolls to the week of `focusWeekId`. On narrow screens, also fits the map's width. */
  focus: () => void;
  zoom: (factor: number) => void;
};

type Tooltip = { x: number; y: number; title: string; sub: string };

const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Pointer travel (px) after which a press counts as a drag, not a tap. Fingers wobble more than mice. */
const DRAG_THRESHOLD = { mouse: 4, touch: 10 } as const;

/** Survives unmounts so returning to the roadmap restores the last pan/zoom (for the same column count). */
let savedView: { cols: Columns; view: ViewState } | null = null;

type Props = {
  weeks: Week[];
  controlsRef?: RefObject<RoadmapControls | null>;
  /** Week shown first on narrow screens and by `focus()`. */
  focusWeekId?: string;
  /** Screen space covered by HTML overlays, so fit and focus keep nodes out from under them. */
  getInsets?: () => Insets;
};

export function RoadmapCanvas({ weeks, controlsRef, focusWeekId, getInsets }: Props) {
  const hostRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  // Read through refs so progress changes don't rebuild the whole scene.
  const focusRef = useRef(focusWeekId);
  focusRef.current = focusWeekId;
  const insetsRef = useRef(getInsets);
  insetsRef.current = getInsets;
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const [cols, setCols] = useState<Columns | null>(null);

  // The column count follows the container size (phone portrait, tablet, desktop, rotation).
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => {
      if (host.clientWidth && host.clientHeight) setCols(pickColumns(weeks, host.clientWidth, host.clientHeight));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, [weeks]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || cols === null) return;
    const app = new Application();
    let initialized = false;
    let disposed = false;
    let teardown: (() => void) | undefined;

    app
      .init({
        resizeTo: host,
        background: C.bg,
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
      })
      .then(() => {
        initialized = true;
        if (disposed) {
          app.destroy(true, { children: true });
          return;
        }
        host.appendChild(app.canvas);
        teardown = buildScene(app, host, weeks, cols, {
          open: (path) => navigateRef.current(path),
          hover: setTooltip,
          controlsRef,
          focusWeekId: () => focusRef.current,
          insets: () => insetsRef.current?.() ?? NO_INSETS,
        });
      });

    return () => {
      disposed = true;
      teardown?.();
      if (initialized) app.destroy(true, { children: true });
    };
  }, [weeks, controlsRef, cols]);

  return (
    <section ref={hostRef} className={styles.host} aria-label="Roadmap of study weeks and tasks">
      {tooltip && (
        <div className={styles.tooltip} style={{ left: tooltip.x, top: tooltip.y }}>
          <div className={styles.tooltipTitle}>{tooltip.title}</div>
          <div className={styles.tooltipSub}>{tooltip.sub}</div>
        </div>
      )}
    </section>
  );
}

type SceneCallbacks = {
  open: (path: string) => void;
  hover: (t: Tooltip | null) => void;
  controlsRef?: RefObject<RoadmapControls | null>;
  focusWeekId: () => string | undefined;
  insets: () => Insets;
};

/** Hit radius around task nodes (world px). Larger than the drawn node so they are tappable with a finger. */
const TASK_HIT_RADIUS = 20;

function buildScene(app: Application, host: HTMLElement, weeks: Week[], cols: Columns, cb: SceneCallbacks): () => void {
  const layout = computeLayout(weeks, cols);
  const world = new Container();
  app.stage.addChild(world);

  drawBands(world, layout);
  const edges = new Graphics();
  const spokes = new Graphics();
  const taskLayer = new Container();
  const weekLayer = new Container();
  world.addChild(edges, spokes, taskLayer, weekLayer);

  const taskById = new Map<string, { task: Task; week: Week }>();
  for (const week of weeks) for (const task of week.tasks) taskById.set(task.id, { task, week });
  const weekById = new Map(weeks.map((w) => [w.id, w]));

  // --- interaction state shared by pan, pinch and taps
  type Point = { x: number; y: number };
  /** Active pointers (mouse or fingers) pressed on the stage. */
  const pointers = new Map<number, Point>();
  let gesture:
    | { kind: 'pan'; start: Point; view: ViewState; moved: boolean; threshold: number }
    | { kind: 'pinch'; dist: number; mid: Point; view: ViewState }
    | null = null;
  let suppressTap = false;
  const isDragging = () => gesture?.kind === 'pinch' || (gesture?.kind === 'pan' && gesture.moved);

  const makeHoverable = (node: Container, radius: number, tip: () => Omit<Tooltip, 'x' | 'y'>, path: string) => {
    node.eventMode = 'static';
    node.cursor = 'pointer';
    node.hitArea = new Circle(0, 0, radius);
    // Touch has no hover: a tooltip would stick under the finger, so only mice get one.
    node.on('pointerover', (e: FederatedPointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      node.scale.set(1.15);
      cb.hover({ ...tip(), x: e.global.x, y: e.global.y });
    });
    node.on('pointermove', (e: FederatedPointerEvent) => {
      if (e.pointerType === 'mouse' && !isDragging()) cb.hover({ ...tip(), x: e.global.x, y: e.global.y });
    });
    node.on('pointerout', () => {
      node.scale.set(1);
      cb.hover(null);
    });
    node.on('pointertap', () => {
      if (suppressTap) return;
      cb.hover(null);
      cb.open(path);
    });
  };

  // --- week nodes
  const weekGfx = new Map<string, { base: Graphics; ring: Graphics; label: Text }>();
  for (const n of layout.weeks) {
    const week = weekById.get(n.weekId)!;
    const node = new Container();
    node.position.set(n.x, n.y);
    const base = new Graphics();
    const ring = new Graphics();
    const label = new Text({
      text: String(week.number),
      style: { fontFamily: FONT, fontSize: 34, fontWeight: '700', fill: C.text },
      resolution: TEXT_RESOLUTION,
    });
    label.anchor.set(0.5);
    const caption = new Text({
      text: 'WEEK',
      style: { fontFamily: FONT, fontSize: 10, fontWeight: '600', fill: C.muted, letterSpacing: 1.5 },
      resolution: TEXT_RESOLUTION,
    });
    caption.anchor.set(0.5);
    caption.y = -24;
    label.y = 4;
    node.addChild(ring, base, caption, label);
    weekLayer.addChild(node);

    const title = new Text({
      text: week.short,
      style: {
        fontFamily: FONT,
        fontSize: 20,
        fontWeight: '600',
        fill: C.text,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: LAYOUT.titleWidth,
        lineHeight: 23,
      },
      resolution: TEXT_RESOLUTION,
    });
    title.anchor.set(0.5, 0);
    title.position.set(n.x, n.y + LAYOUT.weekRadius + 16);
    // Pill behind the title so spokes don't run through the text.
    const pill = new Graphics()
      .roundRect(n.x - title.width / 2 - 8, title.y - 3, title.width + 16, title.height + 6, 8)
      .fill({ color: C.bg, alpha: 0.9 });
    weekLayer.addChild(pill, title);

    weekGfx.set(n.weekId, { base, ring, label });
    makeHoverable(
      node,
      LAYOUT.weekRadius + 8,
      () => {
        const p = weekProgress(week, useProgress.getState().completed);
        return { title: `Week ${week.number}: ${week.title}`, sub: `${p.done}/${p.total} tasks done · click to open` };
      },
      weekPath(week.id),
    );
  }

  // --- task nodes
  const taskGfx = new Map<string, Graphics>();
  for (const t of layout.tasks) {
    const { task, week } = taskById.get(t.taskId)!;
    const node = new Container();
    node.position.set(t.x, t.y);
    const g = new Graphics();
    node.addChild(g);
    taskLayer.addChild(node);
    taskGfx.set(t.taskId, g);
    makeHoverable(
      node,
      TASK_HIT_RADIUS,
      () => ({
        title: task.title,
        sub: taskTooltip(task),
      }),
      taskPath(week.id, task.id),
    );
  }

  // --- progress-dependent drawing
  const redraw = (completed: Record<string, string>) => {
    const statusById = new Map<string, WeekStatus>();
    for (const n of layout.weeks) {
      const week = weekById.get(n.weekId)!;
      const progress = weekProgress(week, completed);
      const status = weekStatus(progress);
      statusById.set(n.weekId, status);
      const { base, ring, label } = weekGfx.get(n.weekId)!;
      const R = LAYOUT.weekRadius;

      base.clear();
      // Only the progress arc carries the "active" colour, so a barely started week doesn't look complete.
      base
        .circle(0, 0, R)
        .fill(status === 'done' ? '#1c2e1f' : C.node)
        .stroke({ width: 2, color: status === 'done' ? C.done : C.line });

      ring.clear();
      ring.circle(0, 0, R + 8).stroke({ width: 5, color: C.ringTrack });
      if (progress.ratio > 0) {
        const start = -Math.PI / 2;
        const end = start + Math.PI * 2 * progress.ratio;
        ring
          .moveTo(Math.cos(start) * (R + 8), Math.sin(start) * (R + 8))
          .arc(0, 0, R + 8, start, end)
          .stroke({ width: 5, color: STATUS_COLOR[status], cap: 'round' });
      }
      label.style.fill = status === 'done' ? C.done : C.text;
    }

    edges.clear();
    const inset = LAYOUT.weekRadius + 14;
    for (const e of layout.edges) {
      const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
      const ux = (e.x2 - e.x1) / len;
      const uy = (e.y2 - e.y1) / len;
      const done = statusById.get(e.fromWeekId) === 'done';
      edges
        .moveTo(e.x1 + ux * inset, e.y1 + uy * inset)
        .lineTo(e.x2 - ux * inset, e.y2 - uy * inset)
        .stroke({ width: 4, color: done ? C.done : C.line, alpha: done ? 0.9 : 0.6, cap: 'round' });
    }

    spokes.clear();
    for (const t of layout.tasks) {
      const w = layout.weeks.find((n) => n.weekId === t.weekId)!;
      const done = Boolean(completed[t.taskId]);
      const from = LAYOUT.weekRadius + 12;
      const to = LAYOUT.taskRing - LAYOUT.taskSize - 3;
      spokes
        .moveTo(w.x + Math.cos(t.angle) * from, w.y + Math.sin(t.angle) * from)
        .lineTo(w.x + Math.cos(t.angle) * to, w.y + Math.sin(t.angle) * to)
        .stroke({ width: 1.5, color: done ? C.done : C.spoke, alpha: done ? 0.7 : 1 });

      const g = taskGfx.get(t.taskId)!;
      g.clear();
      drawTaskShape(g, t.kind, done);
    }
  };

  redraw(useProgress.getState().completed);
  const unsubscribe = useProgress.subscribe((s, prev) => {
    if (s.completed !== prev.completed) redraw(s.completed);
  });

  // --- viewport: restore, fit or focus
  const narrow = cols === 2;
  const fitToScreen = () => applyView(world, fitView(layout.bounds, app.screen.width, app.screen.height, cb.insets()));
  const focusWeek = () => {
    const node = layout.weeks.find((n) => n.weekId === cb.focusWeekId()) ?? layout.weeks[0];
    const top = node.y - LAYOUT.bandPad - BAND_LABEL_SPACE;
    const insets = cb.insets();
    if (narrow) {
      applyView(world, focusView(layout.bounds, top, app.screen.width, app.screen.height, insets));
      return;
    }
    // Wide screens: keep the zoom, center the week in the visible area.
    const view = readView(world);
    const cx = insets.left + (app.screen.width - insets.left - insets.right) / 2;
    const cy = insets.top + (app.screen.height - insets.top - insets.bottom) / 2;
    applyView(world, { ...view, x: cx - node.x * view.scale, y: cy - node.y * view.scale });
  };
  /**
   * The last automatic placement. Re-applied when the screen resizes or rotates, until the
   * user pans or zooms by hand (then their view is kept).
   */
  let placement: 'fit' | 'focus' | null = null;
  const place = (kind: 'fit' | 'focus') => {
    placement = kind;
    if (kind === 'fit') fitToScreen();
    else focusWeek();
  };
  const userMovedView = () => {
    placement = null;
  };
  if (savedView?.cols === cols) applyView(world, savedView.view);
  else place(narrow ? 'focus' : 'fit');
  const onResize = () => {
    if (placement) place(placement);
  };
  app.renderer.on('resize', onResize);

  // --- pan with one pointer, pinch-zoom with two
  const midpoint = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const startGesture = (pointerType: string, moved = false) => {
    const pts = [...pointers.values()];
    if (pts.length >= 2) {
      gesture = {
        kind: 'pinch',
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        mid: midpoint(pts[0], pts[1]),
        view: readView(world),
      };
      suppressTap = true;
      cb.hover(null);
    } else if (pts.length === 1) {
      const threshold = pointerType === 'mouse' ? DRAG_THRESHOLD.mouse : DRAG_THRESHOLD.touch;
      gesture = { kind: 'pan', start: pts[0], view: readView(world), moved, threshold };
    } else {
      gesture = null;
    }
  };

  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', (e: FederatedPointerEvent) => {
    if (pointers.size === 0) suppressTap = false;
    pointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
    startGesture(e.pointerType);
  });
  app.stage.on('globalpointermove', (e: FederatedPointerEvent) => {
    if (!pointers.has(e.pointerId) || !gesture) return;
    pointers.set(e.pointerId, { x: e.global.x, y: e.global.y });
    if (gesture.kind === 'pan') {
      const dx = e.global.x - gesture.start.x;
      const dy = e.global.y - gesture.start.y;
      if (!gesture.moved && Math.hypot(dx, dy) > gesture.threshold) {
        gesture.moved = true;
        host.style.cursor = 'grabbing';
        cb.hover(null);
      }
      if (gesture.moved) {
        userMovedView();
        world.position.set(gesture.view.x + dx, gesture.view.y + dy);
      }
      return;
    }
    const [a, b] = [...pointers.values()];
    if (!a || !b || gesture.dist === 0) return;
    const mid = midpoint(a, b);
    const zoomed = zoomAt(gesture.view, Math.hypot(a.x - b.x, a.y - b.y) / gesture.dist, gesture.mid.x, gesture.mid.y);
    userMovedView();
    applyView(world, { ...zoomed, x: zoomed.x + mid.x - gesture.mid.x, y: zoomed.y + mid.y - gesture.mid.y });
  });
  const release = (e: FederatedPointerEvent) => {
    if (!pointers.delete(e.pointerId)) return;
    if (isDragging()) suppressTap = true;
    // Lifting one finger of a pinch continues as a pan with the other, without triggering a tap.
    startGesture(e.pointerType, true);
    if (!gesture) host.style.cursor = '';
  };
  app.stage.on('pointerup', release);
  app.stage.on('pointerupoutside', release);
  app.stage.on('pointercancel', release);

  const zoomAround = (factor: number, sx: number, sy: number) => {
    userMovedView();
    applyView(world, zoomAt(readView(world), factor, sx, sy));
  };
  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = app.canvas.getBoundingClientRect();
    // Pinch on a trackpad arrives as ctrl+wheel with small deltas.
    const sensitivity = e.ctrlKey ? 0.01 : 0.0015;
    zoomAround(Math.exp(-e.deltaY * sensitivity), e.clientX - rect.left, e.clientY - rect.top);
    cb.hover(null);
  };
  app.canvas.addEventListener('wheel', onWheel, { passive: false });

  if (cb.controlsRef) {
    cb.controlsRef.current = {
      fit: () => place('fit'),
      focus: () => place('focus'),
      zoom: (factor) => zoomAround(factor, app.screen.width / 2, app.screen.height / 2),
    };
  }

  return () => {
    savedView = { cols, view: readView(world) };
    unsubscribe();
    app.canvas.removeEventListener('wheel', onWheel);
    app.renderer.off('resize', onResize);
    if (cb.controlsRef) cb.controlsRef.current = null;
    cb.hover(null);
  };
}

function taskTooltip(task: Task): string {
  const { completed, quizResults } = useProgress.getState();
  const parts = [KIND_META[task.kind].label, `~${task.estimateH}h`];
  const quiz = quizResults[task.id];
  if (task.kind === 'read') parts.push(quiz ? `test ${quiz.best}/${quiz.total}` : 'test not taken');
  if (completed[task.id]) parts.push('✓ done');
  return parts.join(' · ');
}

function drawBands(world: Container, layout: RoadmapLayout) {
  const g = new Graphics();
  world.addChild(g);
  for (const b of layout.bands) {
    g.roundRect(b.x, b.y, b.w, b.h, 28).fill(C.band).stroke({ width: 1.5, color: C.bandBorder });
    const label = new Text({
      text: b.label.toUpperCase(),
      style: { fontFamily: FONT, fontSize: 17, fontWeight: '600', fill: C.bandText, letterSpacing: 1.2 },
      resolution: TEXT_RESOLUTION,
    });
    label.position.set(b.x + 18, b.y - BAND_LABEL_SPACE + 4);
    const maxWidth = b.w - 36;
    while (label.width > maxWidth && label.text.length > 4) label.text = `${label.text.slice(0, -2).trimEnd()}…`;
    world.addChild(label);
  }
}

function drawTaskShape(g: Graphics, kind: Task['kind'], done: boolean) {
  const s = LAYOUT.taskSize;
  const color = KIND_META[kind].color;
  const fill = done ? C.done : C.bg;
  const stroke = { width: 2.5, color: done ? C.done : color };
  if (kind === 'read') g.circle(0, 0, s).fill(fill).stroke(stroke);
  else if (kind === 'code')
    g.roundRect(-s, -s, s * 2, s * 2, 4)
      .fill(fill)
      .stroke(stroke);
  else {
    const d = s * 1.45;
    g.poly([0, -d, d, 0, 0, d, -d, 0]).fill(fill).stroke(stroke);
  }
  if (done) {
    g.moveTo(-s * 0.45, 0)
      .lineTo(-s * 0.1, s * 0.35)
      .lineTo(s * 0.5, -s * 0.35)
      .stroke({ width: 2.5, color: '#0b120d', cap: 'round', join: 'round' });
  }
}
