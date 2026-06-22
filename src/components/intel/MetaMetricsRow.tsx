import { TrendingUp, TrendingDown, Target, Zap, ShieldCheck } from "lucide-react";

export function MetaMetricsRow({ metrics }: { metrics: any }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      
      {/* Meta Velocity */}
      <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-lg flex flex-col justify-between group hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-1">
              Meta Velocity
            </div>
            <div className="flex items-center gap-2">
              {metrics.velocityTrend === "UP" ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
              <div className={`text-3xl font-sans font-bold tracking-widest ${metrics.velocityTrend === "UP" ? "text-green-500" : "text-red-500"}`}>
                {metrics.velocityTrend === "UP" ? "+" : ""}{metrics.velocityPct}%
              </div>
            </div>
          </div>
          <div className="text-[10px] font-sans text-gray-600 uppercase tracking-widest text-right">
            Last 7 Days
          </div>
        </div>
        <div className="w-full h-8 mt-2">
          <svg viewBox="0 0 100 30" className="w-full h-full opacity-60">
            {metrics.velocityTrend === "UP" ? (
              <polyline fill="none" stroke="#22C55E" strokeWidth="2" points="0,25 20,20 40,22 60,10 80,15 100,2" />
            ) : (
              <polyline fill="none" stroke="#EF4444" strokeWidth="2" points="0,5 20,10 40,8 60,20 80,15 100,28" />
            )}
          </svg>
        </div>
      </div>

      {/* Patch Impact */}
      <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-lg flex flex-col justify-between group hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-1">
              Patch Impact
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-500" />
              <div className="text-3xl font-sans font-bold tracking-widest text-cyan-500">
                {metrics.patchVersion}
              </div>
            </div>
          </div>
          <div className="text-[10px] font-sans text-gray-600 uppercase tracking-widest text-right">
            (Recent)
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs font-heading tracking-widest text-white/50 mb-1">
            <span>IMPACT</span>
            <span className="text-cyan-500 font-bold">{metrics.patchImpactLevel.toUpperCase()}</span>
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full bg-cyan-500/20 flex-1" />
            <div className="h-full bg-cyan-500/40 flex-1" />
            <div className="h-full bg-cyan-500/60 flex-1" />
            <div className="h-full bg-cyan-500 flex-1" />
            <div className="h-full bg-cyan-500 flex-1" />
          </div>
        </div>
      </div>

      {/* Trending Archetype */}
      <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-lg flex flex-col justify-between group hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-1">
              Trending Archetype
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              <div className="text-3xl font-sans font-bold tracking-widest text-purple-500 uppercase truncate max-w-[150px]">
                {metrics.topArchetype}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-white/5"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-purple-500"
                strokeDasharray={`${metrics.topArchetypePct}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
          <div>
            <div className="text-lg font-sans font-bold text-white">{metrics.topArchetypePct}%</div>
            <div className="text-[10px] font-heading text-gray-600 uppercase tracking-widest">Usage</div>
          </div>
        </div>
      </div>

      {/* Average Trust Score */}
      <div className="bg-[#0A0A0A] border border-white/5 p-5 rounded-lg flex flex-col justify-between group hover:border-white/10 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-1">
              Average Trust Score
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              <div className="text-3xl font-sans font-bold tracking-widest text-blue-500">
                {metrics.avgTrustScore}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <div className="text-[10px] font-sans text-gray-600 uppercase tracking-widest text-right mb-2">
            Across Analysts
          </div>
          <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex gap-0.5 relative">
             <div className="absolute top-0 left-0 h-full bg-blue-500/20 w-full" />
             <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: `${metrics.avgTrustScore}%` }} />
          </div>
        </div>
      </div>

    </div>
  );
}
