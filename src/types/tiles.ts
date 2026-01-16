import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { 
  faLeaf, 
  faTree, 
  faMountain, 
  faWater, 
  faSun, 
  faLandmark, 
  faCircle, 
  faHome, 
  faQuestion 
} from '@fortawesome/free-solid-svg-icons';

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
 * Using bioluminescent color palette for dark mode
 */
export interface TileStyle {
  id: TileType;
  label: string;
  fillColor: string;        // Hex fill color
  strokeColor: string;      // Hex stroke color
  iconColor: string;        // Icon color
  icon: IconDefinition;     // Font Awesome icon
  description: string;
}

/**
 * Bioluminescent color palette
 * Inspired by deep sea creatures and aurora borealis
 */
export const TILE_STYLES: Record<TileType, TileStyle> = {
  plains: {
    id: 'plains',
    label: 'Plains',
    fillColor: '#0d3320',      // Deep green
    strokeColor: '#22c55e',    // Bright green glow
    iconColor: '#4ade80',      // Light green
    icon: faLeaf,
    description: 'Open grassland, safe to traverse'
  },
  forest: {
    id: 'forest',
    label: 'Forest',
    fillColor: '#052e16',      // Darker green
    strokeColor: '#16a34a',    // Forest green glow
    iconColor: '#22c55e',      // Medium green
    icon: faTree,
    description: 'Dense woods with limited visibility'
  },
  mountain: {
    id: 'mountain',
    label: 'Mountain',
    fillColor: '#1e293b',      // Slate
    strokeColor: '#64748b',    // Slate glow
    iconColor: '#94a3b8',      // Light slate
    icon: faMountain,
    description: 'Impassable without climbing gear'
  },
  water: {
    id: 'water',
    label: 'Water',
    fillColor: '#0c1929',      // Deep blue
    strokeColor: '#0ea5e9',    // Cyan glow
    iconColor: '#38bdf8',      // Light cyan
    icon: faWater,
    description: 'Requires a boat to cross'
  },
  desert: {
    id: 'desert',
    label: 'Desert',
    fillColor: '#422006',      // Deep amber
    strokeColor: '#f59e0b',    // Amber glow
    iconColor: '#fbbf24',      // Light amber
    icon: faSun,
    description: 'Hot terrain, drains extra energy'
  },
  ruins: {
    id: 'ruins',
    label: 'Ruins',
    fillColor: '#2e1065',      // Deep purple
    strokeColor: '#a855f7',    // Purple glow
    iconColor: '#c084fc',      // Light purple
    icon: faLandmark,
    description: 'Ancient structures with treasures'
  },
  void: {
    id: 'void',
    label: 'Void',
    fillColor: '#0a0a0a',      // Near black
    strokeColor: '#374151',    // Dim gray
    iconColor: '#4b5563',      // Gray
    icon: faCircle,
    description: 'Corrupted land, dangerous'
  },
  settlement: {
    id: 'settlement',
    label: 'Settlement',
    fillColor: '#451a03',      // Deep orange
    strokeColor: '#fb923c',    // Orange glow
    iconColor: '#fdba74',      // Light orange
    icon: faHome,
    description: 'Player-built structure'
  },
  fog: {
    id: 'fog',
    label: 'Unknown',
    fillColor: '#111827',      // Dark gray
    strokeColor: '#374151',    // Gray
    iconColor: '#6b7280',      // Medium gray
    icon: faQuestion,
    description: 'Unexplored territory'
  }
};
