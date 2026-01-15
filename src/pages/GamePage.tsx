import { useRef, useState, useEffect } from 'react';
import { HexCanvas } from '../components/canvas/HexCanvas';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { pixelToHex, hexRound, hexKey, hexesInRadius } from '../lib/hexMath';
import type { HexTile } from '../types/tiles';
import type { HexCoord } from '../types/game';
import { HelpCircle } from 'lucide-react';

/**
 * Generate a simple tile for demo purposes
 */
function generateTile(q: number, r: number): HexTile {
  // Simple hash function for consistent random-like generation
  const hash = (q * 374761393 + r * 668265263) & 0x7fffffff;
  const random = (hash % 1000) / 1000;
  
  // Determine tile type based on hash
  let type: HexTile['type'] = 'plains';
  if (random < 0.1) type = 'forest';
  else if (random < 0.15) type = 'mountain';
  else if (random < 0.2) type = 'water';
  else if (random < 0.25) type = 'desert';
  else if (random < 0.27) type = 'ruins';
  
  return {
    q,
    r,
    type,
    revealed: true, // All revealed for Phase 1 demo
    explored: false,
    elevation: 0,
    biome: 'temperate',
    movementCost: 1,
    passable: type !== 'mountain' && type !== 'water',
  };
}

export function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<Map<string, HexTile>>(new Map());
  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  // Initialize tiles on mount
  useEffect(() => {
    const initialTiles = new Map<string, HexTile>();
    const center = { q: 0, r: 0 };
    const radius = 10;
    
    const hexes = hexesInRadius(center, radius);
    hexes.forEach(coord => {
      const key = hexKey(coord.q, coord.r);
      initialTiles.set(key, generateTile(coord.q, coord.r));
    });
    
    setTiles(initialTiles);
  }, []);

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Handle tile click
  const handleTileClick = (coords: HexCoord) => {
    const key = hexKey(coords.q, coords.r);
    setSelectedTile(key);
    
    // Generate tile if it doesn't exist
    if (!tiles.has(key)) {
      setTiles(prev => {
        const newTiles = new Map(prev);
        newTiles.set(key, generateTile(coords.q, coords.r));
        return newTiles;
      });
    }
  };

  // Canvas interaction
  const { viewState, isDragging, handlers } = useCanvasInteraction({
    containerRef,
    pixelToHex: (x, y) => {
      const { q, r } = pixelToHex(x, y);
      return hexRound(q, r);
    },
    onTileClick: handleTileClick,
  });

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden">
      {/* Help Icon */}
      <div className="absolute top-4 right-4 z-10">
        <a
          href="https://lukesteuber.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
        >
          <HelpCircle size={24} />
        </a>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={`w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handlers.handleMouseDown}
        onMouseMove={handlers.handleMouseMove}
        onMouseUp={handlers.handleMouseUp}
        onMouseLeave={handlers.handleMouseLeave}
        onClick={handlers.handleCanvasClick}
        onTouchStart={handlers.handleTouchStart}
        onTouchMove={handlers.handleTouchMove}
        onTouchEnd={handlers.handleTouchEnd}
      >
        {containerSize.width > 0 && (
          <HexCanvas
            tiles={tiles}
            viewState={viewState}
            selectedTile={selectedTile}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            onTileClick={handleTileClick}
          />
        )}
      </div>

      {/* Info Bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-white/80 text-lg font-mono">
        Zoom: {Math.round(viewState.zoom * 100)}% | Tiles: {tiles.size}
        {selectedTile && ` | Selected: ${selectedTile}`}
      </div>
    </div>
  );
}
