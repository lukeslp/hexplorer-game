import { Link } from 'wouter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faQuestion } from '@fortawesome/free-solid-svg-icons';

export function MainMenu() {
  return (
    <div className="w-full h-full bg-[#050508] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Help Icon */}
      <div className="absolute top-6 right-6">
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

      {/* Title */}
      <div className="text-center mb-16 relative z-10">
        <h1 className="text-8xl font-bold text-white mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
            HEXPLORER
          </span>
        </h1>
        <p className="text-2xl text-white/50 font-light">
          Explore the infinite hexagonal world
        </p>
      </div>

      {/* Play Button */}
      <Link href="/game">
        <button className="relative group flex items-center gap-4 bg-gradient-to-r from-green-500 to-cyan-500 text-black px-10 py-5 rounded-xl text-2xl font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-green-500/20 hover:shadow-green-500/40">
          <FontAwesomeIcon icon={faPlay} className="text-xl" />
          Start Exploring
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
        </button>
      </Link>

      {/* Footer */}
      <div className="absolute bottom-8 text-white/30 text-base font-light">
        Phase 1: Core Canvas & Rendering
      </div>
    </div>
  );
}
