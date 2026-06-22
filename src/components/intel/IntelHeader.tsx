import { Wifi, Radio } from "lucide-react";

interface IntelHeaderProps {
  generatedAt: string;
  stats: {
    totalBuilds: number;
    totalActivities: number;
    omegaThreats: number;
  };
}

export function IntelHeader({ generatedAt, stats }: IntelHeaderProps) {
  const date = new Date(generatedAt);
  const dateStr = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });

  return (
    <div className="mb-8">
      {/* Classification bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-gray-600 mb-4 pb-2 border-b border-gray-900">
        <span>SHD_OS // INTEL_FEED // CLASSIFICATION: OMEGA</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-green-500">
            <Radio className="w-3 h-3 animate-pulse" /> UPLINK ACTIVE
          </span>
          <span className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" /> {stats.totalBuilds} BUILDS INDEXED
          </span>
          <span>{stats.omegaThreats} OMEGA THREATS</span>
        </div>
      </div>

      {/* Main heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
        <div>
          <div className="text-[11px] font-sans font-bold text-primary/80 tracking-widest uppercase mb-2">
            Morning Intelligence Briefing
          </div>
          <h1 className="text-3xl md:text-5xl font-black font-sans text-white tracking-tight uppercase">
            FIELD REPORT // <span className="text-gray-400">{dateStr.toUpperCase()}</span>
          </h1>
          <p className="text-sm text-gray-400 font-sans mt-3 font-medium">
            Generated: {timeStr} · Covers {stats.totalActivities} activities · {stats.totalBuilds} builds analysed
          </p>
        </div>
        <div className="flex-shrink-0 glass-card px-5 py-3 text-right border-primary/30">
          <div className="text-[9px] font-sans font-bold text-gray-500 tracking-widest mb-1">INTELLIGENCE STATUS</div>
          <div className="text-sm font-black font-mono text-primary neon-text flex items-center justify-end gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,106,0,0.8)]" /> CURRENT
          </div>
        </div>
      </div>

      {/* Divider rule */}
      <div className="mt-8 h-px bg-gradient-to-r from-primary/60 via-primary/10 to-transparent" />
    </div>
  );
}
