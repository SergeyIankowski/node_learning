import type { Container } from 'pixi.js';
import type { Bounds } from './layout';

export const MIN_ZOOM = 0.15;
export const MAX_ZOOM = 2.5;

export type ViewState = { x: number; y: number; scale: number };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export type Insets = { top: number; right: number; bottom: number; left: number };

/** Scale and offset that fit `bounds` into a `width`×`height` screen minus `insets` (space taken by overlays). */
export function fitView(
  bounds: Bounds,
  width: number,
  height: number,
  insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 },
  padding = 0.96,
): ViewState {
  const bw = bounds.maxX - bounds.minX;
  const bh = bounds.maxY - bounds.minY;
  const aw = Math.max(1, width - insets.left - insets.right);
  const ah = Math.max(1, height - insets.top - insets.bottom);
  const scale = clamp(Math.min(aw / bw, ah / bh) * padding, MIN_ZOOM, MAX_ZOOM);
  return {
    scale,
    x: insets.left + aw / 2 - (bounds.minX + bw / 2) * scale,
    y: insets.top + ah / 2 - (bounds.minY + bh / 2) * scale,
  };
}

/**
 * Fits the map's **width** to the screen and scrolls vertically so that `focusTop` (a world y)
 * sits at the top of the visible area, without scrolling past the map's edges.
 * Used on narrow screens, where fitting the whole map would make it unreadably small.
 */
export function focusView(
  bounds: Bounds,
  focusTop: number,
  width: number,
  height: number,
  insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 },
  padding = 0.98,
): ViewState {
  const bw = bounds.maxX - bounds.minX;
  const aw = Math.max(1, width - insets.left - insets.right);
  const scale = clamp((aw / bw) * padding, MIN_ZOOM, MAX_ZOOM);
  const x = insets.left + aw / 2 - (bounds.minX + bw / 2) * scale;
  const highest = insets.top - bounds.minY * scale;
  const lowest = height - insets.bottom - bounds.maxY * scale;
  const y = Math.max(Math.min(insets.top - focusTop * scale, highest), Math.min(lowest, highest));
  return { scale, x, y };
}

/** Zooms `view` by `factor` keeping the screen point (`sx`, `sy`) fixed. */
export function zoomAt(view: ViewState, factor: number, sx: number, sy: number): ViewState {
  const scale = clamp(view.scale * factor, MIN_ZOOM, MAX_ZOOM);
  const k = scale / view.scale;
  return { scale, x: sx - (sx - view.x) * k, y: sy - (sy - view.y) * k };
}

export function applyView(world: Container, view: ViewState) {
  world.position.set(view.x, view.y);
  world.scale.set(view.scale);
}

export function readView(world: Container): ViewState {
  return { x: world.position.x, y: world.position.y, scale: world.scale.x };
}
