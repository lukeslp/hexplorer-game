import { useRef, useState, useEffect, useCallback } from 'react';
import { HexCanvas } from '../components/canvas/HexCanvas';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import { pixelToHex, hexRound, hexKey, hexesInRadius } from '../lib/hexMath';
import type { HexTile } from '../types/tiles';
import { TILE_STYLES } from '../types/tiles';
import type { HexCoord } from '../types/game';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestion, 
  faExpand, 
  faCompress, 
  faHome,
  faPlus,
  faMinus
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'wouter';

/**
 * Generate a tile using deterministic hash for consistency
 */
function generateTile(q: number, r: number): HexTile {
  // Improved hash function for better distribution
  const hash = Math.abs((q * 374761393 + r * 668265263) ^ (q * r * 1234567));
  const random = (hash % 10000) / 10000;
  
  // Determine tile type with weighted probabilities
  let type: HexTile['type'] = 'plains';
  if (random < 0.12) type = 'forest';
  else if (random < 0.18) type = 'mountain';
  else if (random < 0.25) type = 'water';
  else if (random < 0.32) type = 'desert';
  else if (random < 0.35) type = 'ruins';
  else if (random < 0.36) type = 'void';
  
  return {
    q,
    r,
    type,
    revealed: true,
    explored: false,
    elevation: Math.floor((hash % 6)),
    biome: 'temperate',
    movementCost: type === 'mountain' ? 3 : type === 'water' ? 2 : 1,
    passable: type !== 'void',
  };
}

export function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<Map<string, HexTile>>(new Map());
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize tiles on mount
  useEffect(() => {
    const initialTiles = new Map<string, HexTile>();
    const center = { q: 0, r: 0 };
    const radius = 15;
    
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

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle tile click
  const handleTileClick = (coords: HexCoord) => {
    const key = hexKey(coords.q, coords.r);
    setSelectedTile(prev => prev === key ? null : key);
    
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
  const { viewState, isDragging, handlers, setViewState } = useCanvasInteraction({
    containerRef,
    pixelToHex: (x, y) => {
      const { q, r } = pixelToHex(x, y);
      return hexRound(q, r);
    },
    onTileClick: handleTileClick,
  });

  // Zoom controls
  const handleZoomIn = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.25, 3)
    }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.25, 0.25)
    }));
  };

  // Get selected tile info
  const selectedTileData = selectedTile ? tiles.get(selectedTile) : null;
  const selectedStyle = selectedTileData ? TILE_STYLES[selectedTileData.type] : null;

  return (
    <div className="w-full h-full bg-[#050508] relative overflow-hidden">
      {/* Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Home button */}
        <Link href="/">
          <button 
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
            title="Back to Menu"
          >
            <FontAwesomeIcon icon={faHome} className="text-lg" />
          </button>
        </Link>

        {/* Right controls */}
        <div className="flex gap-2">
          {/* Fullscreen toggle */}
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-lg" />
          </button>

          {/* Help link */}
          <a
            href="https://lukesteuber.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
            title="Help"
          >
            <FontAwesomeIcon icon={faQuestion} className="text-lg" />
          </a>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
          title="Zoom In"
        >
          <FontAwesomeIcon icon={faPlus} className="text-lg" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
          title="Zoom Out"
        >
          <FontAwesomeIcon icon={faMinus} className="text-lg" />
        </button>
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
        onWheel={handlers.handleWheel}
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-6">
          {/* Zoom level */}
          <div className="text-white/60 text-base font-mono">
            <span className="text-white/40">Zoom:</span> {Math.round(viewState.zoom * 100)}%
          </div>
          
          {/* Tile count */}
          <div className="text-white/60 text-base font-mono">
            <span className="text-white/40">Tiles:</span> {tiles.size}
          </div>
          
          {/* Selected tile info */}
          {selectedTileData && selectedStyle && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <FontAwesomeIcon 
                icon={selectedStyle.icon} 
                style={{ color: selectedStyle.iconColor }}
                className="text-lg"
              />
              <div>
                <div className="text-white/90 text-base font-medium">{selectedStyle.label}</div>
                <div className="text-white/50 text-sm">{selectedTileData.q}, {selectedTileData.r}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tile Legend (bottom right) */}
      <div className="absolute bottom-6 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <div className="text-white/40 text-sm mb-3 font-medium">Legend</div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-2">
            {Object.values(TILE_STYLES).slice(0, 6).map(style => (
              <div key={style.id} className="flex items-center gap-2">
                <FontAwesomeIcon 
                  icon={style.icon} 
                  style={{ color: style.iconColor }}
                  className="text-sm w-4"
                />
                <span className="text-white/60 text-sm">{style.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
