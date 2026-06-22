import { Wifi, Radio, Activity, Target, ShieldAlert } from "lucide-react";

interface CommandCenterHeroProps {
  generatedAt: string;
  stats: {
    totalBuilds: number;
    totalActivities: number;
    omegaThreats: number;
  };
}

export function CommandCenterHero({ generatedAt, stats }: CommandCenterHeroProps) {
  const date = new Date(generatedAt);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  return (
    <div className="relative w-full rounded-3xl overflow-hidden glass-panel border border-primary/20 mb-10 min-h-[300px] flex flex-col justify-end">
      
      {/* --- Visual Background --- */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Radar / Grid SVG Pattern */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="none" />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 106, 0, 0.15)" strokeWidth="1" />
            </pattern>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,106,0,0.2)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#radarGrid)" />
          
          {/* Concentric Circles for Radar effect */}
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="rgba(255,106,0,0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,106,0,0.1)" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="60%" fill="none" stroke="rgba(255,106,0,0.05)" strokeWidth="2" strokeDasharray="10 10" />
          
          <rect width="100%" height="100%" fill="url(#radarGlow)" />
        </svg>
        
        {/* Sweeping radar line animation (pure CSS) */}
        <div className="absolute top-1/2 left-1/2 w-[100%] h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-30 origin-left animate-[spin_10s_linear_infinite]" style={{ transform: 'translateY(-50%)' }} />
      </div>

      {/* --- Dark Overlay Gradient --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />

      {/* --- Content --- */}
      <div className="relative z-10 p-8 md:p-12 w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-16">
          <div className="flex items-center gap-4 text-[10px] font-sans font-bold tracking-widest text-primary/70 uppercase">
            <span className="flex items-center gap-2">
              <Radio className="w-4 h-4 animate-pulse text-primary" />
              SHD_OS // INTEL_FEED
            </span>
            <span className="hidden md:inline px-3 py-1 bg-white/5 rounded-full border border-white/10">
              CLASSIFICATION: OMEGA
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="glass-card px-4 py-2 flex items-center gap-3 text-[10px] font-sans font-bold uppercase text-gray-400">
              <Activity className="w-3.5 h-3.5 text-primary" />
              {stats.totalActivities} Activities
            </div>
            <div className="glass-card px-4 py-2 flex items-center gap-3 text-[10px] font-sans font-bold uppercase text-gray-400">
              <Wifi className="w-3.5 h-3.5 text-primary" />
              {stats.totalBuilds} Builds Indexed
            </div>
          </div>
        </div>

        {/* Hero Title & Primary Stats */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
          <div>
            <div className="text-sm font-sans font-bold text-primary/80 tracking-[0.3em] uppercase mb-3">
              Global Meta Status Report
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-sans text-white tracking-tight uppercase leading-none drop-shadow-[0_0_15px_rgba(255,106,0,0.3)]">
              FIELD REPORT // <br className="md:hidden" /><span className="text-primary neon-text">{dateStr}</span>
            </h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-400 font-sans font-medium">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Live Sync Complete at {timeStr}
            </div>
          </div>
          
          {/* Critical Alerts Highlight */}
          {stats.omegaThreats > 0 && (
            <div className="glass-card border-red-500/30 bg-red-500/10 p-6 flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors" />
              <ShieldAlert className="w-12 h-12 text-red-500 relative z-10" />
              <div className="relative z-10">
                <div className="text-4xl font-black font-mono text-red-400 neon-text leading-none mb-1">
                  {stats.omegaThreats}
                </div>
                <div className="text-[10px] font-sans font-bold text-red-500/70 tracking-widest uppercase">
                  Omega Level Threats
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
