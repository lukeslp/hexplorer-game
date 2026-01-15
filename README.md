# Hexplorer Game

A procedural exploration game built on an infinite hexagonal grid. Built with React, TypeScript, and Vite.

## 🎮 Features (Phase 1 Complete)

- **Infinite Hexagonal Grid**: Explore an endless world of procedurally generated tiles
- **Smooth Pan & Zoom**: Intuitive canvas controls for both mouse and touch
- **Viewport Culling**: Efficient rendering of only visible tiles
- **Tile Variety**: 9 different terrain types (plains, forest, mountain, water, desert, ruins, void, settlement, fog)
- **Minimalist Design**: Clean, distraction-free interface inspired by Minesweeper

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🏗️ Architecture

This project follows the comprehensive architecture defined in the [original Hexplorer docs](https://github.com/lukeslp/hexplorer/tree/master/docs).

### Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 4
- **Routing**: Wouter 3
- **Icons**: Lucide React

### Project Structure

```
src/
├── components/
│   ├── canvas/         # Hex rendering components
│   ├── ui/             # UI components (future)
│   └── game/           # Game-specific components (future)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Route pages
└── types/              # TypeScript definitions
```

## 📋 Implementation Status

### ✅ Phase 1: Core Canvas & Rendering (Complete)

- [x] Project setup with Vite + React + TypeScript
- [x] Hex math utilities (axial coordinate system)
- [x] Canvas interaction hook (pan/zoom/drag)
- [x] HexTile component with styling
- [x] HexCanvas component with viewport culling
- [x] GamePage with procedural generation
- [x] MainMenu and routing

### 🔄 Phase 2: Game State & World Generation (Next)

- [ ] Central game state management
- [ ] Procedural world generation with Perlin noise
- [ ] Biome system
- [ ] Resource distribution

### 📅 Future Phases

- Phase 3: Player & Fog of War
- Phase 4: UI & Player Actions
- Phase 5: Game Loop & Persistence
- Phase 6: Polish & Finalization

## 🎯 Design Principles

- **Minimalist Interface**: No complex menus, clean grid-based design
- **Larger Fonts**: Improved readability throughout
- **Client-Side Only**: No server dependencies for core gameplay
- **Mobile Responsive**: Full touch support
- **Performance First**: Viewport culling and memoization

## 🔗 Related Projects

- [Hexmind](https://github.com/lukeslp/hexmind) - The brainstorming tool that inspired this canvas implementation
- [Hexplorer Docs](https://github.com/lukeslp/hexplorer) - Original design documents and architecture

## 📝 License

MIT

## 👤 Author

Luke Steuber
- Website: [lukesteuber.com](https://lukesteuber.com)
- Dr. Eamer: [dr.eamer.dev](https://dr.eamer.dev)
