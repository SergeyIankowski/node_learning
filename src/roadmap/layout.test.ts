import { describe, expect, it } from 'vitest';
import { weeks } from '../data';
import { COLUMN_OPTIONS, computeLayout, LAYOUT, pickColumns } from './layout';
import { focusView } from './viewport';

describe('computeLayout', () => {
  const layout = computeLayout(weeks);

  it('places every week and every task', () => {
    expect(layout.weeks).toHaveLength(20);
    expect(layout.tasks).toHaveLength(weeks.reduce((n, w) => n + w.tasks.length, 0));
    expect(layout.edges).toHaveLength(19);
    expect(layout.bands).toHaveLength(10);
  });

  it('keeps week rings from overlapping', () => {
    const minDist = 2 * (LAYOUT.taskRing + LAYOUT.taskSize);
    for (let i = 0; i < layout.weeks.length; i++) {
      for (let j = i + 1; j < layout.weeks.length; j++) {
        const a = layout.weeks[i];
        const b = layout.weeks[j];
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(minDist);
      }
    }
  });

  it('keeps task nodes of one week apart from each other', () => {
    for (const w of weeks) {
      const nodes = layout.tasks.filter((t) => t.weekId === w.id);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          expect(Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y), w.id).toBeGreaterThan(
            LAYOUT.taskSize * 3,
          );
        }
      }
    }
  });

  it('keeps the sector below each week free for its title', () => {
    for (const t of layout.tasks) {
      const fromDown = Math.abs(Math.atan2(Math.sin(t.angle - Math.PI / 2), Math.cos(t.angle - Math.PI / 2)));
      expect(fromDown, t.taskId).toBeGreaterThanOrEqual(LAYOUT.titleSector);
    }
  });

  it('connects consecutive weeks with short edges (serpentine path)', () => {
    for (const e of layout.edges) {
      const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1);
      expect(len).toBeLessThanOrEqual(Math.max(LAYOUT.spacingX, LAYOUT.spacingY));
    }
  });

  it('puts every node inside the bounds', () => {
    const { minX, minY, maxX, maxY } = layout.bounds;
    for (const n of [...layout.weeks, ...layout.tasks]) {
      expect(n.x).toBeGreaterThan(minX);
      expect(n.x).toBeLessThan(maxX);
      expect(n.y).toBeGreaterThan(minY);
      expect(n.y).toBeLessThan(maxY);
    }
  });
});

describe('responsive layouts', () => {
  it.each(COLUMN_OPTIONS)('keeps both halves of a program week on one row with %i columns', (cols) => {
    const l = computeLayout(weeks, cols);
    expect(l.bands).toHaveLength(10);
    for (const b of l.bands) expect(b.h).toBe(2 * LAYOUT.bandPad);
    const rows = new Set(l.weeks.map((w) => w.y)).size;
    expect(rows).toBe(Math.ceil(20 / cols));
  });

  it('picks 2 columns on phones (both orientations), 4 on portrait tablets, 6 on wide screens', () => {
    expect(pickColumns(weeks, 390, 790)).toBe(2);
    expect(pickColumns(weeks, 844, 334)).toBe(2);
    expect(pickColumns(weeks, 820, 1100)).toBe(4);
    expect(pickColumns(weeks, 1400, 844)).toBe(6);
  });

  it('focusView fits the width and clamps the vertical scroll to the map', () => {
    const { bounds } = computeLayout(weeks, 2);
    const insets = { top: 90, right: 8, bottom: 60, left: 8 };
    const top = focusView(bounds, bounds.minY, 390, 790, insets);
    expect(top.scale * (bounds.maxX - bounds.minX)).toBeLessThanOrEqual(390 - 16);
    expect(top.y + bounds.minY * top.scale).toBeCloseTo(insets.top);
    // Asking for a point beyond the end stops at the bottom edge instead of showing empty space.
    const end = focusView(bounds, bounds.maxY + 5000, 390, 790, insets);
    expect(end.y + bounds.maxY * end.scale).toBeCloseTo(790 - insets.bottom);
  });
});
