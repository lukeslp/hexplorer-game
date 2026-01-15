import { Link } from 'wouter';
import { Play, HelpCircle } from 'lucide-react';

export function MainMenu() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center relative">
      {/* Help Icon */}
      <div className="absolute top-4 right-4">
        <a
          href="https://lukesteuber.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors"
        >
          <HelpCircle size={24} />
        </a>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-7xl font-bold text-white mb-4">
          HEXPLORER
        </h1>
        <p className="text-xl text-white/60">
          Explore the infinite hexagonal world
        </p>
      </div>

      {/* Play Button */}
      <Link href="/game">
        <button className="flex items-center gap-3 bg-yellow-400 text-black px-8 py-4 rounded-lg text-xl font-semibold hover:bg-yellow-300 transition-all transform hover:scale-105 active:scale-95">
          <Play size={24} fill="currentColor" />
          Start Exploring
        </button>
      </Link>

      {/* Footer */}
      <div className="absolute bottom-8 text-white/40 text-sm">
        Phase 1: Core Canvas & Rendering
      </div>
    </div>
  );
}
