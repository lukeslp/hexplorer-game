import { useMemo } from 'react';
import type { HexTile as HexTileType } from '../../types/tiles';
import type { ViewState, HexCoord } from '../../types/game';
import { HexTile } from './HexTile';
import { hexKey, pixelToHex, hexRound, hexesInRadius } from '../../lib/hexMath';

interface HexCanvasProps {
  tiles: Map<string, HexTileType>;
  viewState: ViewState;
  selectedTile: string | null;
  containerWidth: number;
  containerHeight: number;
  onTileClick: (coords: HexCoord) => void;
}

/**
 * Main canvas component that renders the hex grid
 * Implements viewport culling for performance
 */
export function HexCanvas({
  tiles,
  viewState,
  selectedTile,
  containerWidth,
  containerHeight,
  onTileClick,
}: HexCanvasProps) {
  // Calculate visible tiles based on viewport
  const visibleTiles = useMemo(() => {
    // Calculate the center hex coordinate in world space
    const worldCenterX = -viewState.x / viewState.zoom;
    const worldCenterY = -viewState.y / viewState.zoom;
    
    const hexCoord = pixelToHex(worldCenterX, worldCenterY);
    const centerHex = hexRound(hexCoord.q, hexCoord.r);
    
    // Calculate radius to cover viewport plus margin
    const maxDimension = Math.max(containerWidth, containerHeight);
    const radius = Math.ceil((maxDimension / viewState.zoom) / 80) + 2;
    
    // Get all hexes in radius
    const hexesInView = hexesInRadius(centerHex, radius);
    
    // Filter to only tiles that exist in our map
    return hexesInView
      .map(coord => {
        const key = hexKey(coord.q, coord.r);
        const tile = tiles.get(key);
        return tile ? { key, tile } : null;
      })
      .filter((item): item is { key: string; tile: HexTileType } => item !== null);
  }, [tiles, viewState, containerWidth, containerHeight]);

  return (
    <svg
      width={containerWidth}
      height={containerHeight}
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
    >
      {/* Center the coordinate system */}
      <g transform={`translate(${containerWidth / 2}, ${containerHeight / 2})`}>
        {visibleTiles.map(({ key, tile }) => (
          <HexTile
            key={key}
            tile={tile}
            viewState={viewState}
            isSelected={key === selectedTile}
            onClick={() => onTileClick({ q: tile.q, r: tile.r })}
          />
        ))}
      </g>
    </svg>
  );
}
