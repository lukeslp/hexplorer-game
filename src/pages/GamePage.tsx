import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { HexCanvas } from '../components/canvas/HexCanvas';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';
import {
  pixelToHex,
  hexRound,
  hexKey,
  hexesInRadius,
  hexDistance,
  hexRing,
  parseHexKey,
  hexToPixel,
} from '../lib/hexMath';
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
  faMinus,
  faBolt,
  faCampground,
  faHammer,
  faBoxOpen,
  faCompass,
  faWater,
  faTree,
  faMountain,
  faGem,
  faCrosshairs,
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'wouter';
import { toast } from 'sonner';

const VISION_RADIUS = 2;
const GENERATION_RADIUS = 6;
const PULSE_RADIUS = 4;
const PULSE_COST = 2;
const BASE_ENERGY = 12;
const CAMP_RECOVERY = 4;

const OUTPOST_COST = {
  wood: 2,
  ore: 1,
  water: 1,
};

const BEACON_RING = 12;
const BEACON_SEED = 1337;

/**
 * Generate a tile using deterministic hash for consistency
 */
function generateTile(q: number, r: number, beaconCoord: HexCoord): HexTile {
  const hash = Math.abs((q * 374761393 + r * 668265263) ^ (q * r * 1234567));
  const random = (hash % 10000) / 10000;

  let type: HexTile['type'] = 'plains';
  if (random < 0.12) type = 'forest';
  else if (random < 0.18) type = 'mountain';
  else if (random < 0.25) type = 'water';
  else if (random < 0.32) type = 'desert';
  else if (random < 0.35) type = 'ruins';
  else if (random < 0.36) type = 'void';

  if (q === 0 && r === 0) {
    type = 'settlement';
  }

  const isBeacon = q === beaconCoord.q && r === beaconCoord.r;
  if (isBeacon) {
    type = 'beacon';
  }

  const hasCache = !isBeacon && type !== 'void' && type !== 'water' && hash % 37 === 0;

  const movementCost =
    type === 'mountain'
      ? 3
      : type === 'water'
        ? 3
        : type === 'forest'
          ? 2
          : type === 'desert'
            ? 2
            : type === 'ruins'
              ? 2
              : 1;

  return {
    q,
    r,
    type,
    revealed: false,
    explored: false,
    elevation: Math.floor(hash % 6),
    biome: 'temperate',
    movementCost,
    passable: type !== 'void',
    feature: isBeacon ? 'beacon' : hasCache ? 'cache' : undefined,
    featureDiscovered: false,
  };
}

interface PlayerState {
  position: HexCoord;
  energy: number;
  maxEnergy: number;
}

interface InventoryState {
  wood: number;
  water: number;
  ore: number;
  relics: number;
  supplies: number;
}

export function GamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [tiles, setTiles] = useState<Map<string, HexTile>>(new Map());
  const [selectedTile, setSelectedTile] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  const beaconCoord = useMemo<HexCoord>(() => {
    const ring = hexRing({ q: 0, r: 0 }, BEACON_RING);
    const index = Math.abs(BEACON_SEED % ring.length);
    return ring[index];
  }, []);

  const [player, setPlayer] = useState<PlayerState>({
    position: { q: 0, r: 0 },
    energy: BASE_ENERGY,
    maxEnergy: BASE_ENERGY,
  });

  const [inventory, setInventory] = useState<InventoryState>({
    wood: 0,
    water: 0,
    ore: 0,
    relics: 0,
    supplies: 0,
  });

  const hydrateTiles = useCallback(
    (center: HexCoord, radius: number, revealRadius: number) => {
      setTiles(prev => {
        const next = new Map(prev);
        const coords = hexesInRadius(center, radius);

        coords.forEach(coord => {
          const key = hexKey(coord.q, coord.r);
          const distance = hexDistance(center, coord);
          const shouldReveal = distance <= revealRadius;
          const existing = next.get(key) ?? generateTile(coord.q, coord.r, beaconCoord);

          next.set(key, {
            ...existing,
            revealed: existing.revealed || shouldReveal,
            explored: existing.explored || distance === 0,
          });
        });

        return next;
      });
    },
    [beaconCoord]
  );

  const revealPulse = useCallback(
    (center: HexCoord, radius: number) => {
      setTiles(prev => {
        const next = new Map(prev);
        const coords = hexesInRadius(center, radius);

        coords.forEach(coord => {
          const key = hexKey(coord.q, coord.r);
          const existing = next.get(key) ?? generateTile(coord.q, coord.r, beaconCoord);
          next.set(key, {
            ...existing,
            revealed: true,
          });
        });

        return next;
      });
    },
    [beaconCoord]
  );

  useEffect(() => {
    hydrateTiles(player.position, GENERATION_RADIUS, VISION_RADIUS);
  }, [hydrateTiles, player.position]);

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

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const grantExplorationReward = useCallback((tile: HexTile) => {
    const updates: Partial<InventoryState> = {};
    let message = '';

    switch (tile.type) {
      case 'forest':
        updates.wood = 1;
        message = 'Gathered timber.';
        break;
      case 'water':
        updates.water = 1;
        message = 'Filled your canteen.';
        break;
      case 'mountain':
        updates.ore = 1;
        message = 'Found ore.';
        break;
      case 'desert':
        updates.supplies = 1;
        message = 'Collected sun-baked supplies.';
        break;
      case 'ruins':
        updates.relics = 1;
        message = 'Recovered an ancient relic.';
        break;
      case 'plains':
        updates.supplies = 1;
        message = 'Foraged the open plains.';
        break;
      default:
        break;
    }

    if (tile.feature === 'cache' && !tile.featureDiscovered) {
      updates.supplies = (updates.supplies ?? 0) + 2;
      message = 'Discovered a hidden cache.';
    }

    const hasUpdates = Object.keys(updates).length > 0;
    if (!hasUpdates) return;

    setInventory(prev => ({
      ...prev,
      wood: prev.wood + (updates.wood ?? 0),
      water: prev.water + (updates.water ?? 0),
      ore: prev.ore + (updates.ore ?? 0),
      relics: prev.relics + (updates.relics ?? 0),
      supplies: prev.supplies + (updates.supplies ?? 0),
    }));

    if (message) {
      toast(message, { duration: 1800 });
    }
  }, []);

  const handleTileClick = useCallback(
    (coords: HexCoord) => {
      const key = hexKey(coords.q, coords.r);
      setSelectedTile(key);

      const distance = hexDistance(player.position, coords);
      if (distance === 0) return;
      if (distance > 1) return;

      const existingTile = tiles.get(key) ?? generateTile(coords.q, coords.r, beaconCoord);

      if (!existingTile.passable) {
        toast('That terrain is impassable.', { duration: 1600 });
        return;
      }

      if (player.energy < existingTile.movementCost) {
        toast('You are too exhausted to move.', { duration: 1600 });
        return;
      }

      const wasExplored = existingTile.explored;

      setPlayer(prev => ({
        ...prev,
        position: coords,
        energy: Math.max(prev.energy - existingTile.movementCost, 0),
      }));

      setTiles(prev => {
        const next = new Map(prev);
        const current = next.get(key) ?? existingTile;
        next.set(key, {
          ...current,
          revealed: true,
          explored: true,
          featureDiscovered:
            current.feature === 'cache' || current.type === 'beacon' ? true : current.featureDiscovered,
        });
        return next;
      });

      if (!wasExplored) {
        grantExplorationReward(existingTile);
      }

      if (existingTile.type === 'beacon' && !hasWon) {
        setHasWon(true);
        toast('Beacon secured. The expedition is complete.', { duration: 2400 });
      }
    },
    [beaconCoord, grantExplorationReward, hasWon, player.energy, player.position, tiles]
  );

  const { viewState, isDragging, handlers, setViewState } = useCanvasInteraction({
    containerRef,
    pixelToHex: (x, y) => {
      const { q, r } = pixelToHex(x, y);
      return hexRound(q, r);
    },
    onTileClick: handleTileClick,
  });

  const handleZoomIn = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.25, 3),
    }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.25, 0.25),
    }));
  };

  const handlePulse = () => {
    if (player.energy < PULSE_COST) {
      toast('Not enough energy to pulse.', { duration: 1600 });
      return;
    }

    setPlayer(prev => ({
      ...prev,
      energy: Math.max(prev.energy - PULSE_COST, 0),
    }));
    revealPulse(player.position, PULSE_RADIUS);
    toast('Pulse reveals nearby anomalies.', { duration: 1600 });
  };

  const handleRest = () => {
    const currentKey = hexKey(player.position.q, player.position.r);
    const currentTile = tiles.get(currentKey);

    if (currentTile?.type === 'settlement') {
      setPlayer(prev => ({ ...prev, energy: prev.maxEnergy }));
      toast('Rested at the outpost.', { duration: 1600 });
      return;
    }

    if (inventory.wood < 1) {
      toast('You need wood to set up camp.', { duration: 1600 });
      return;
    }

    setInventory(prev => ({ ...prev, wood: Math.max(prev.wood - 1, 0) }));
    setPlayer(prev => ({
      ...prev,
      energy: Math.min(prev.energy + CAMP_RECOVERY, prev.maxEnergy),
    }));
    toast('Campfire restores your energy.', { duration: 1600 });
  };

  const handleBuildOutpost = () => {
    if (!selectedTile) return;
    const coords = parseHexKey(selectedTile);
    const distance = hexDistance(player.position, coords);
    if (distance > 1) {
      toast('Choose an adjacent tile to build.', { duration: 1600 });
      return;
    }

    if (
      inventory.wood < OUTPOST_COST.wood ||
      inventory.ore < OUTPOST_COST.ore ||
      inventory.water < OUTPOST_COST.water
    ) {
      toast('Not enough resources to build an outpost.', { duration: 1600 });
      return;
    }

    setInventory(prev => ({
      ...prev,
      wood: prev.wood - OUTPOST_COST.wood,
      ore: prev.ore - OUTPOST_COST.ore,
      water: prev.water - OUTPOST_COST.water,
    }));

    setTiles(prev => {
      const next = new Map(prev);
      const key = hexKey(coords.q, coords.r);
      const current = next.get(key) ?? generateTile(coords.q, coords.r, beaconCoord);
      next.set(key, {
        ...current,
        type: 'settlement',
        revealed: true,
        explored: true,
        movementCost: 1,
        passable: true,
        feature: undefined,
        featureDiscovered: false,
      });
      return next;
    });

    toast('Outpost established.', { duration: 1800 });
  };

  const handleRecenter = () => {
    const { x, y } = hexToPixel(player.position.q, player.position.r);
    setViewState(prev => ({
      ...prev,
      x: -x * prev.zoom,
      y: -y * prev.zoom,
    }));
  };

  const selectedTileData = selectedTile ? tiles.get(selectedTile) : null;
  const displayTileType = selectedTileData
    ? selectedTileData.revealed
      ? selectedTileData.type
      : 'fog'
    : null;
  const selectedStyle = displayTileType ? TILE_STYLES[displayTileType] : null;

  const distanceToBeacon = hexDistance(player.position, beaconCoord);
  const signalStrength = Math.max(0, Math.round(100 - distanceToBeacon * 6));

  const exploredCount = useMemo(
    () => Array.from(tiles.values()).filter(tile => tile.explored).length,
    [tiles]
  );

  const canBuildOutpost = useMemo(() => {
    if (!selectedTile) return false;
    const coords = parseHexKey(selectedTile);
    const distance = hexDistance(player.position, coords);
    const selected = tiles.get(selectedTile);
    if (!selected || !selected.passable) return false;
    if (selected.type === 'settlement' || selected.type === 'beacon') return false;

    return (
      distance === 1 &&
      inventory.wood >= OUTPOST_COST.wood &&
      inventory.ore >= OUTPOST_COST.ore &&
      inventory.water >= OUTPOST_COST.water
    );
  }, [inventory.ore, inventory.water, inventory.wood, player.position, selectedTile, tiles]);

  const legendTypes: Array<keyof typeof TILE_STYLES> = [
    'plains',
    'forest',
    'mountain',
    'water',
    'desert',
    'ruins',
    'settlement',
    'beacon',
  ];

  return (
    <div className="w-full h-full bg-[#050508] relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3">
        <Link href="/">
          <button
            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
            title="Back to Menu"
          >
            <FontAwesomeIcon icon={faHome} className="text-lg" />
          </button>
        </Link>

        <div className="bg-black/60 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 w-64">
          <div className="text-white/40 text-xs uppercase tracking-[0.2em]">Expedition</div>
          <div className="mt-2 text-white/90 text-sm font-medium">Secure the beacon</div>
          <div className="mt-3 flex items-center justify-between text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCompass} className="text-xs" />
              Signal
            </span>
            <span className="text-white/80">{signalStrength}%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-white/60 text-sm">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxOpen} className="text-xs" />
              Explored
            </span>
            <span className="text-white/80">{exploredCount} tiles</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={toggleFullscreen}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white/90 transition-all backdrop-blur-sm border border-white/10"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          <FontAwesomeIcon icon={isFullscreen ? faCompress : faExpand} className="text-lg" />
        </button>

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
            playerPosition={player.position}
          />
        )}
      </div>

      <div className="absolute bottom-6 left-6 z-10 w-64">
        <div className="bg-black/60 backdrop-blur-md px-4 py-4 rounded-xl border border-white/10 space-y-3">
          <div className="text-white/40 text-xs uppercase tracking-[0.2em]">Vitals</div>
          <div className="flex items-center justify-between text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faBolt} className="text-xs" />
              Energy
            </span>
            <span className="text-white/90">{player.energy}/{player.maxEnergy}</span>
          </div>
          <div className="flex items-center justify-between text-white/70 text-sm">
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faGem} className="text-xs" />
              Relics
            </span>
            <span className="text-white/90">{inventory.relics}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-white/60 text-xs pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTree} />
              {inventory.wood}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faWater} />
              {inventory.water}
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMountain} />
              {inventory.ore}
            </div>
          </div>
          <div className="text-white/50 text-xs">Supplies: {inventory.supplies}</div>
        </div>

        <div className="mt-4 bg-black/60 backdrop-blur-md px-4 py-4 rounded-xl border border-white/10 space-y-2">
          <div className="text-white/40 text-xs uppercase tracking-[0.2em]">Actions</div>
          <button
            onClick={handlePulse}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCrosshairs} className="text-xs" />
              Pulse Scan
            </span>
            <span className="text-white/40">-{PULSE_COST} energy</span>
          </button>
          <button
            onClick={handleRest}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCampground} className="text-xs" />
              Rest
            </span>
            <span className="text-white/40">+{CAMP_RECOVERY}</span>
          </button>
          <button
            onClick={handleBuildOutpost}
            disabled={!canBuildOutpost}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
              canBuildOutpost
                ? 'bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30'
                : 'bg-white/5 text-white/40 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faHammer} className="text-xs" />
              Build Outpost
            </span>
            <span className="text-white/40">2 wood 1 ore 1 water</span>
          </button>
          <button
            onClick={handleRecenter}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faCompass} className="text-xs" />
              Recenter
            </span>
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-xl border border-white/10 flex items-center gap-6">
          <div className="text-white/60 text-base font-mono">
            <span className="text-white/40">Zoom:</span> {Math.round(viewState.zoom * 100)}%
          </div>
          <div className="text-white/60 text-base font-mono">
            <span className="text-white/40">Tiles:</span> {tiles.size}
          </div>
          {selectedTileData && selectedStyle && (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <FontAwesomeIcon
                icon={selectedStyle.icon}
                style={{ color: selectedStyle.iconColor }}
                className="text-lg"
              />
              <div>
                <div className="text-white/90 text-base font-medium">{selectedStyle.label}</div>
                <div className="text-white/50 text-sm">
                  {selectedTileData.q}, {selectedTileData.r}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 right-4 z-10">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 w-64">
          <div className="text-white/40 text-sm mb-3 font-medium">Legend</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {legendTypes.map(type => {
              const style = TILE_STYLES[type];
              return (
                <div key={style.id} className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={style.icon}
                    style={{ color: style.iconColor }}
                    className="text-sm w-4"
                  />
                  <span className="text-white/60 text-sm">{style.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {hasWon && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-[#0a0a12] border border-white/10 rounded-2xl p-8 text-center max-w-md">
            <div className="text-3xl text-white font-semibold">Beacon Secured</div>
            <p className="text-white/60 mt-3 text-sm">
              The signal is yours. Return to base or keep exploring to build outposts and gather relics.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/">
                <button className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20">
                  Back to Menu
                </button>
              </Link>
              <button
                onClick={() => setHasWon(false)}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
