import { memo } from 'react';
import type { HexTile as HexTileType } from '../../types/tiles';
import { TILE_STYLES } from '../../types/tiles';
import { hexToPixel, hexagonPath } from '../../lib/hexMath';

interface HexTileProps {
  tile: HexTileType;
  viewState: { x: number; y: number; zoom: number };
  isSelected?: boolean;
  onClick?: () => void;
}

/**
 * Individual hex tile component
 * Renders a single hexagon with appropriate styling based on tile type
 */
export const HexTile = memo(function HexTile({ 
  tile, 
  viewState, 
  isSelected = false,
  onClick 
}: HexTileProps) {
  const { q, r, type, revealed } = tile;
  const style = TILE_STYLES[type];
  
  // Calculate pixel position
  const { x, y } = hexToPixel(q, r);
  
  // Apply view transform
  const screenX = x * viewState.zoom + viewState.x;
  const screenY = y * viewState.zoom + viewState.y;
  
  // Generate hex path
  const path = hexagonPath();
  
  return (
    <g
      transform={`translate(${screenX}, ${screenY}) scale(${viewState.zoom})`}
      onClick={onClick}
      className="cursor-pointer transition-opacity hover:opacity-80"
    >
      {/* Background fill */}
      <path
        d={path}
        className={`${style.bgColor} ${style.borderColor} ${isSelected ? 'stroke-yellow-400' : ''} transition-all duration-200`}
        strokeWidth={isSelected ? 4 : 2}
      />
      
      {/* Icon/emoji for revealed tiles */}
      {revealed && (
        <text
          x={0}
          y={0}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={32}
          className="pointer-events-none select-none"
        >
          {style.icon}
        </text>
      )}
      
      {/* Coordinates for debugging (optional) */}
      {import.meta.env.DEV && (
        <text
          x={0}
          y={20}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          className="fill-white/50 pointer-events-none select-none"
        >
          {q},{r}
        </text>
      )}
    </g>
  );
});
