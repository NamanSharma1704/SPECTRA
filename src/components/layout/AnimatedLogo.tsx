export function AnimatedLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Intense glow aura */}
      <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
      
      <svg
        viewBox="0 0 100 100"
        className="relative z-10 w-full h-full text-primary drop-shadow-[0_0_8px_rgba(255,106,0,1)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Hexagon Frame (Static) */}
        <polygon 
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          className="opacity-30" 
        />

        {/* Counter-rotating dashed orbit */}
        <g className="origin-center animate-[spin_10s_linear_infinite_reverse] will-change-transform">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="15 30" className="opacity-50" />
          <circle cx="50" cy="10" r="2.5" fill="currentColor" />
          <circle cx="50" cy="90" r="2.5" fill="currentColor" />
        </g>

        {/* Primary rotating orbital ring */}
        <g className="origin-center animate-[spin_6s_linear_infinite] will-change-transform">
          <circle cx="50" cy="50" r="34" stroke="currentColor" strokeWidth="2" strokeDasharray="60 40" className="opacity-80" />
          {/* Orbital targeting nodes */}
          <path d="M 50 16 L 47 10 L 53 10 Z" fill="currentColor" />
          <path d="M 50 84 L 47 90 L 53 90 Z" fill="currentColor" />
        </g>

        {/* Central Core (Faceted Diamond/Engram) */}
        <g className="animate-pulse">
          {/* Top Left Facet */}
          <polygon points="50,25 25,50 50,50" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
          {/* Top Right Facet */}
          <polygon points="50,25 75,50 50,50" fill="currentColor" fillOpacity="0.8" stroke="currentColor" strokeWidth="1" />
          {/* Bottom Left Facet */}
          <polygon points="50,75 25,50 50,50" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1" />
          {/* Bottom Right Facet */}
          <polygon points="50,75 75,50 50,50" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" />
          
          {/* Core Energy Dot */}
          <circle cx="50" cy="50" r="3" fill="#FFF" className="shadow-[0_0_15px_#FFF]" />
        </g>

        {/* HUD Crosshairs */}
        <line x1="2" y1="50" x2="18" y2="50" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
        <line x1="82" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
        <line x1="50" y1="2" x2="50" y2="18" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
        <line x1="50" y1="82" x2="50" y2="98" stroke="currentColor" strokeWidth="1.5" className="opacity-60" />
      </svg>
    </div>
  );
}
