import { Shield, Radio, Wifi } from "lucide-react";

interface DossierHeaderProps {
  build: {
    id: string;
    name: string;
    archetype: string | null;
    created_at: string;
    creators: { name: string; is_verified: boolean } | null;
  };
  verdict: "DEPLOY" | "SITUATIONAL" | "AVOID";
}

const ARCHETYPE_COLORS: Record<string, string> = {
  DPS: "text-orange-400 border-orange-400/40 bg-orange-400/10",
  TANK: "text-blue-400 border-blue-400/40 bg-blue-400/10",
  SUPPORT: "text-green-400 border-green-400/40 bg-green-400/10",
  SKILL: "text-purple-400 border-purple-400/40 bg-purple-400/10",
  HYBRID: "text-cyan-400 border-cyan-400/40 bg-cyan-400/10",
};

export function DossierHeader({ build, verdict }: DossierHeaderProps) {
  const archetype = build.archetype ?? "UNKNOWN";
  const archetypeStyle = ARCHETYPE_COLORS[archetype] ?? "text-gray-400 border-gray-400/40 bg-gray-400/10";
  const buildCode = build.id.split("-")[0].toUpperCase();

  return (
    <header className="border-b border-gray-800 pb-6 mb-8">
      {/* Top classification bar */}
      <div className="flex items-center justify-between mb-4 text-[10px] font-mono">
        <div className="flex items-center gap-4 text-gray-600">
          <span className="border border-gray-800 px-2 py-0.5">SHD_OS // BUILD_INTELLIGENCE</span>
          <span>REF: {buildCode}</span>
          <span>CLASSIFICATION: OMEGA CLEARANCE</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-green-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            ISAC UPLINK ACTIVE
          </span>
          <span className="flex items-center gap-1.5 text-gray-600">
            <Wifi className="w-3 h-3" /> LATENCY: 12MS
          </span>
        </div>
      </div>

      {/* Main header row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Archetype badge */}
            <span className={`text-xs font-mono font-bold tracking-widest border px-2 py-0.5 ${archetypeStyle}`}>
              {archetype}
            </span>
            {/* Creator badge */}
            {build.creators && (
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-cyan-500" />
                {build.creators.name.toUpperCase()}
                {build.creators.is_verified && (
                  <span className="text-cyan-400 text-[9px] border border-cyan-400/30 px-1">VERIFIED</span>
                )}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-black font-mono text-white tracking-tight uppercase leading-tight">
            {build.name}
          </h1>
        </div>

        {/* Verdict stamp */}
        <div className={`flex-shrink-0 border-2 px-6 py-3 text-center font-mono font-black tracking-widest uppercase
          ${verdict === "DEPLOY" ? "border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]" :
            verdict === "SITUATIONAL" ? "border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(255,106,0,0.2)]" :
            "border-red-700 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"}`}>
          <div className="text-[10px] opacity-60 mb-1">FIELD VERDICT</div>
          <div className="text-2xl">{verdict}</div>
        </div>
      </div>
    </header>
  );
}
