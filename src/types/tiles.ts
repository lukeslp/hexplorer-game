/**
 * Tile type identifiers
 */
export type TileType = 
  | 'plains'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'desert'
  | 'ruins'
  | 'void'
  | 'settlement'
  | 'fog';

/**
 * Biome identifiers for regional theming
 */
export type BiomeType = 
  | 'temperate'
  | 'arctic'
  | 'tropical'
  | 'volcanic'
  | 'corrupted';

/**
 * Core hex tile data structure
 */
export interface HexTile {
  /** Axial Q coordinate */
  q: number;
  
  /** Axial R coordinate */
  r: number;
  
  /** Terrain type */
  type: TileType;
  
  /** Is tile visible (not fogged)? */
  revealed: boolean;
  
  /** Has player physically visited? */
  explored: boolean;
  
  /** Elevation level (0-5) */
  elevation: number;
  
  /** Regional biome */
  biome: BiomeType;
  
  /** Movement cost modifier */
  movementCost: number;
  
  /** Can player enter this tile? */
  passable: boolean;
}

/**
 * Tile visual styling configuration
 */
export interface TileStyle {
  id: TileType;
  label: string;
  color: string;           // Tailwind text color
  bgColor: string;         // Tailwind fill color
  borderColor: string;     // Tailwind stroke color
  icon: string;            // Emoji or icon name
  description: string;
}

/**
 * Map of tile type to visual style
 */
export const TILE_STYLES: Record<TileType, TileStyle> = {
  plains: {
    id: 'plains',
    label: 'Plains',
    color: 'text-green-400',
    bgColor: 'fill-green-500/30',
    borderColor: 'stroke-green-500',
    icon: '🌿',
    description: 'Open grassland, safe to traverse'
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    color: 'text-emerald-600',
    bgColor: 'fill-emerald-700/40',
    borderColor: 'stroke-emerald-600',
    icon: '🌲',
    description: 'Dense woods with limited visibility'
  },
  mountain: {
    id: 'mountain',
    label: 'Mountain',
    color: 'text-slate-400',
    bgColor: 'fill-slate-500/40',
    borderColor: 'stroke-slate-400',
    icon: '⛰️',
    description: 'Impassable without climbing gear'
  },
  water: {
    id: 'water',
    label: 'Water',
    color: 'text-blue-400',
    bgColor: 'fill-blue-500/40',
    borderColor: 'stroke-blue-400',
    icon: '💧',
    description: 'Requires a boat to cross'
  },
  desert: {
    id: 'desert',
    label: 'Desert',
    color: 'text-yellow-400',
    bgColor: 'fill-yellow-500/30',
    borderColor: 'stroke-yellow-500',
    icon: '🏜️',
    description: 'Hot terrain, drains extra energy'
  },
  ruins: {
    id: 'ruins',
    label: 'Ruins',
    color: 'text-purple-400',
    bgColor: 'fill-purple-500/30',
    borderColor: 'stroke-purple-400',
    icon: '🏛️',
    description: 'Ancient structures with treasures'
  },
  void: {
    id: 'void',
    label: 'Void',
    color: 'text-gray-600',
    bgColor: 'fill-gray-900/60',
    borderColor: 'stroke-gray-700',
    icon: '⚫',
    description: 'Corrupted land, dangerous'
  },
  settlement: {
    id: 'settlement',
    label: 'Settlement',
    color: 'text-amber-400',
    bgColor: 'fill-amber-500/30',
    borderColor: 'stroke-amber-400',
    icon: '🏠',
    description: 'Player-built structure'
  },
  fog: {
    id: 'fog',
    label: 'Unknown',
    color: 'text-gray-500',
    bgColor: 'fill-gray-800/80',
    borderColor: 'stroke-gray-600',
    icon: '❓',
    description: 'Unexplored territory'
  }
};
