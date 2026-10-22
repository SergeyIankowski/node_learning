import { useCallback, useRef } from 'react';
import { Button, LinkButton, ProgressBar } from '../components/ui';
import { allTasks, taskPath, weeks } from '../data';
import { RoadmapCanvas, type RoadmapControls } from '../roadmap/RoadmapCanvas';
import type { Insets } from '../roadmap/viewport';
import { overallProgress, useProgress } from '../store/progress';
import styles from './RoadmapPage.module.css';

const GAP = 8;

/**
 * Space each overlay panel takes from the map. A panel is assigned to whichever edge it is
 * anchored to that costs the smaller share of the screen: the desktop intro panel takes the
 * left side, while the phone intro bar takes the top.
 */
function measureInsets(stage: HTMLElement, panels: (HTMLElement | null)[]): Insets {
  const s = stage.getBoundingClientRect();
  const insets: Insets = { top: GAP, right: GAP, bottom: GAP, left: GAP };
  for (const el of panels) {
    if (!el || el.offsetParent === null) continue;
    const r = el.getBoundingClientRect();
    const atLeft = r.left + r.width / 2 < s.left + s.width / 2;
    const atTop = r.top + r.height / 2 < s.top + s.height / 2;
    const horizontal = (atLeft ? r.right - s.left : s.right - r.left) + GAP;
    const vertical = (atTop ? r.bottom - s.top : s.bottom - r.top) + GAP;
    if (horizontal / s.width < vertical / s.height) {
      if (atLeft) insets.left = Math.max(insets.left, horizontal);
      else insets.right = Math.max(insets.right, horizontal);
    } else if (atTop) insets.top = Math.max(insets.top, vertical);
    else insets.bottom = Math.max(insets.bottom, vertical);
  }
  return insets;
}

export function RoadmapPage() {
  const controls = useRef<RoadmapControls | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const controlsBarRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const completed = useProgress((s) => s.completed);
  const next = allTasks.find((r) => !completed[r.task.id]);

  const getInsets = useCallback(
    () =>
      stageRef.current
        ? measureInsets(stageRef.current, [introRef.current, controlsBarRef.current, legendRef.current])
        : { top: GAP, right: GAP, bottom: GAP, left: GAP },
    [],
  );

  return (
    <div ref={stageRef} className={styles.stage}>
      <RoadmapCanvas weeks={weeks} controlsRef={controls} focusWeekId={next?.week.id} getInsets={getInsets} />

      <div ref={introRef} className={`${styles.panel} ${styles.intro}`}>
        <h1>RS School Node.js · 20-week plan</h1>
        <p className={styles.description}>
          Each program week is split into two study weeks. Click a week or a task node to open it.
        </p>
        <ProgressBar progress={overallProgress(weeks, completed)} />
        {next ? (
          <div className={styles.nextRow}>
            <div className={styles.next}>
              <span>Up next · week {next.week.number}</span>
              <br />
              <strong>{next.task.title}</strong>
            </div>
            <LinkButton to={taskPath(next.week.id, next.task.id)} variant="primary" size="sm">
              Continue →
            </LinkButton>
          </div>
        ) : (
          <div className={styles.next}>🎉 All tasks done. Time for the interview prep!</div>
        )}
      </div>

      <div ref={controlsBarRef} className={`${styles.panel} ${styles.controls}`}>
        <Button size="sm" variant="ghost" onClick={() => controls.current?.zoom(1.25)} aria-label="Zoom in">
          +
        </Button>
        <Button size="sm" variant="ghost" onClick={() => controls.current?.zoom(0.8)} aria-label="Zoom out">
          −
        </Button>
        <Button size="sm" variant="ghost" onClick={() => controls.current?.focus()} title="Show the current week">
          Now
        </Button>
        <Button size="sm" variant="ghost" onClick={() => controls.current?.fit()} title="Show the whole map">
          Fit
        </Button>
      </div>

      <div ref={legendRef} className={`${styles.panel} ${styles.legend}`}>
        <span>
          <i className={`${styles.swatch} ${styles.read}`} /> Read
        </span>
        <span>
          <i className={`${styles.swatch} ${styles.code}`} /> Code
        </span>
        <span>
          <i className={`${styles.swatch} ${styles.project}`} /> Project
        </span>
        <span>
          <i className={`${styles.swatch} ${styles.done}`} /> Done
        </span>
        <span className={styles.hint}>Drag to pan · scroll or pinch to zoom</span>
      </div>
    </div>
  );
}
