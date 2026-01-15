/**
 * Hex coordinate utilities using axial coordinate system
 * 
 * Axial coordinates use two axes (q, r) at 60° angle.
 * This is more efficient than cube coordinates for storage.
 * 
 * Reference: https://www.redblobgames.com/grids/hexagons/
 */

import type { HexCoord } from '../types/game';

// Constants
export const HEX_SIZE = 80;
export const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
export const HEX_HEIGHT = 2 * HEX_SIZE;

/**
 * Pixel coordinate type
 */
export interface PixelCoord {
  x: number;
  y: number;
}

/**
 * The 6 directions in a pointy-top hexagon
 */
export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },   // East
  { q: 1, r: -1 },  // Northeast
  { q: 0, r: -1 },  // Northwest
  { q: -1, r: 0 },  // West
  { q: -1, r: 1 },  // Southwest
  { q: 0, r: 1 },   // Southeast
];

/**
 * Convert axial hex coordinates to pixel coordinates
 * Uses pointy-top orientation
 */
export function hexToPixel(q: number, r: number): PixelCoord {
  const x = HEX_SIZE * (Math.sqrt(3) * q + (Math.sqrt(3) / 2) * r);
  const y = HEX_SIZE * ((3 / 2) * r);
  return { x, y };
}

/**
 * Convert pixel coordinates to axial hex coordinates
 * Returns fractional coordinates (use hexRound for integer)
 */
export function pixelToHex(x: number, y: number): HexCoord {
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / HEX_SIZE;
  const r = ((2 / 3) * y) / HEX_SIZE;
  return { q, r };
}

/**
 * Round fractional hex coordinates to nearest integer hex
 */
export function hexRound(q: number, r: number): HexCoord {
  // Convert to cube coordinates for rounding
  const s = -q - r;
  
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  
  // Reset the component with largest diff
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  }
  
  return { q: rq, r: rr };
}

/**
 * Calculate distance between two hexes
 */
export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (
    Math.abs(a.q - b.q) +
    Math.abs(a.q + a.r - b.q - b.r) +
    Math.abs(a.r - b.r)
  ) / 2;
}

/**
 * Get all neighbors of a hex
 */
export function hexNeighbors(q: number, r: number): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => ({
    q: q + dir.q,
    r: r + dir.r,
  }));
}

/**
 * Get all hexes within a radius
 */
export function hexesInRadius(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];
  
  for (let dq = -radius; dq <= radius; dq++) {
    for (let dr = Math.max(-radius, -dq - radius); dr <= Math.min(radius, -dq + radius); dr++) {
      results.push({
        q: center.q + dq,
        r: center.r + dr,
      });
    }
  }
  
  return results;
}

/**
 * Get hexes forming a ring at a specific distance
 */
export function hexRing(center: HexCoord, radius: number): HexCoord[] {
  if (radius === 0) return [center];
  
  const results: HexCoord[] = [];
  let hex: HexCoord = {
    q: center.q + HEX_DIRECTIONS[4].q * radius,
    r: center.r + HEX_DIRECTIONS[4].r * radius,
  };
  
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push({ ...hex });
      hex = {
        q: hex.q + HEX_DIRECTIONS[i].q,
        r: hex.r + HEX_DIRECTIONS[i].r,
      };
    }
  }
  
  return results;
}

/**
 * Create a unique string key from hex coordinates
 */
export function hexKey(q: number, r: number): string {
  return `${q},${r}`;
}

/**
 * Parse hex key back to coordinates
 */
export function parseHexKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

/**
 * Line of sight check between two hexes
 * Returns all hexes along the line
 */
export function hexLine(a: HexCoord, b: HexCoord): HexCoord[] {
  const n = hexDistance(a, b);
  const results: HexCoord[] = [];
  
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    const q = a.q + (b.q - a.q) * t;
    const r = a.r + (b.r - a.r) * t;
    results.push(hexRound(q, r));
  }
  
  return results;
}

/**
 * Generate SVG path for a hexagon
 */
export function hexagonPath(): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = HEX_SIZE * Math.cos(angle);
    const y = HEX_SIZE * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return `M${points.join('L')}Z`;
}
