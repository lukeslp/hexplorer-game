/**
 * Canvas view state (pan/zoom)
 */
export interface ViewState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Hex coordinate type
 */
export interface HexCoord {
  q: number;
  r: number;
}
