import { useState, useRef, useEffect } from 'react';
import type { ViewState, HexCoord } from '../types/game';

export interface CanvasInteractionHandlers {
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  handleCanvasClick: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent) => void;
  handleWheel: (e: React.WheelEvent) => void;
}

export interface UseCanvasInteractionOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  pixelToHex: (x: number, y: number) => HexCoord;
  onTileClick?: (coords: HexCoord) => void;
}

export interface UseCanvasInteractionReturn {
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
  isDragging: boolean;
  handlers: CanvasInteractionHandlers;
}

/**
 * Custom hook for canvas pan/zoom/drag interactions
 * Handles both mouse and touch events for desktop and mobile
 */
export function useCanvasInteraction(
  options: UseCanvasInteractionOptions
): UseCanvasInteractionReturn {
  const {
    containerRef,
    pixelToHex,
    onTileClick,
  } = options;

  const [viewState, setViewState] = useState<ViewState>({ x: 0, y: 0, zoom: 1.0 });
  const [isDragging, setIsDragging] = useState(false);
  const [touchDistance, setTouchDistance] = useState(0);

  const dragStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDragged.current = false;
    dragStart.current = { x: e.clientX - viewState.x, y: e.clientY - viewState.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    hasDragged.current = true;
    setViewState((prev) => ({
      ...prev,
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Canvas click handler
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Skip if dragging occurred
    if (hasDragged.current) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Convert screen coordinates to canvas coordinates (accounting for pan and zoom)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const screenX = (e.clientX - rect.left - centerX - viewState.x) / viewState.zoom;
    const screenY = (e.clientY - rect.top - centerY - viewState.y) / viewState.zoom;

    // Convert to hex coordinates
    const hexCoords = pixelToHex(screenX, screenY);
    onTileClick?.(hexCoords);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasDragged.current = false;
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      dragStart.current = {
        x: e.touches[0].clientX - viewState.x,
        y: e.touches[0].clientY - viewState.y,
      };
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setTouchDistance(Math.sqrt(dx * dx + dy * dy));
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      hasDragged.current = true;
      setViewState((prev) => ({
        ...prev,
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      }));
    }
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newTouchDistance = Math.sqrt(dx * dx + dy * dy);
      const scale = newTouchDistance / touchDistance;
      setViewState((prev) => ({
        ...prev,
        zoom: Math.min(Math.max(prev.zoom * scale, 0.1), 3),
      }));
      setTouchDistance(newTouchDistance);
    }
  };

  const handleTouchEnd = (_e: React.TouchEvent) => {
    // Check for tap (no drag)
    if (!hasDragged.current && touchStartPos.current) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const screenX = (touchStartPos.current.x - rect.left - centerX - viewState.x) / viewState.zoom;
        const screenY = (touchStartPos.current.y - rect.top - centerY - viewState.y) / viewState.zoom;
        const hexCoords = pixelToHex(screenX, screenY);
        onTileClick?.(hexCoords);
      }
    }
    touchStartPos.current = null;
    setIsDragging(false);
    setTouchDistance(0);
  };

  // Wheel handler for zoom (uses native event for non-passive listener)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setViewState((prev) => ({
        ...prev,
        zoom: Math.min(Math.max(prev.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.1), 3),
      }));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // React wheel handler (for direct use)
  const handleWheelReact = (e: React.WheelEvent) => {
    e.preventDefault();
    setViewState((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * (e.deltaY > 0 ? 0.9 : 1.1), 0.25), 3),
    }));
  };

  const handlers: CanvasInteractionHandlers = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleCanvasClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleWheel: handleWheelReact,
  };

  return {
    viewState,
    setViewState,
    isDragging,
    handlers,
  };
}
