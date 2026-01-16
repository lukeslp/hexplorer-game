import { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
 * Renders a single hexagon with bioluminescent styling
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
  
  // Glow filter ID for selected tiles
  const glowId = `glow-${q}-${r}`;
  
  return (
    <g
      transform={`translate(${screenX}, ${screenY}) scale(${viewState.zoom})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow filter for selection */}
      {isSelected && (
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
      
      {/* Background fill with glow effect */}
      <path
        d={path}
        fill={style.fillColor}
        stroke={isSelected ? '#fbbf24' : style.strokeColor}
        strokeWidth={isSelected ? 3 : 1.5}
        filter={isSelected ? `url(#${glowId})` : undefined}
        style={{
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />
      
      {/* Subtle inner glow for depth */}
      <path
        d={path}
        fill="none"
        stroke={style.strokeColor}
        strokeWidth={0.5}
        opacity={0.3}
        transform="scale(0.85)"
      />
      
      {/* Icon for revealed tiles */}
      {revealed && (
        <foreignObject 
          x={-16} 
          y={-16} 
          width={32} 
          height={32}
          style={{ pointerEvents: 'none' }}
        >
          <div 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}
          >
            <FontAwesomeIcon 
              icon={style.icon} 
              style={{ 
                color: style.iconColor,
                fontSize: '18px',
                filter: `drop-shadow(0 0 4px ${style.iconColor}40)`
              }} 
            />
          </div>
        </foreignObject>
      )}
    </g>
  );
});
