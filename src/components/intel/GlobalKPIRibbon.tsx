import { Activity, ShieldAlert, Crosshair, TrendingUp } from "lucide-react";

export function GlobalKPIRibbon({ stats, generatedAt }: { stats: any; generatedAt: string }) {
  // Mock Volatility calculation based on total builds
  const volatilityScore = Math.min(100, Math.round(stats.totalBuilds / 2.5));
  const volatilityLevel = volatilityScore > 80 ? "HIGH" : volatilityScore > 50 ? "MODERATE" : "STABLE";
  const volatilityColor = volatilityLevel === "HIGH" ? "text-rose-500" : volatilityLevel === "MODERATE" ? "text-[#FF6A00]" : "text-emerald-500";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* KPI 1 */}
      <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 p-4 flex items-center justify-between rounded-lg shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] transition-colors hover:border-[#FF6A00]/30">
        <div>
          <div className="text-[10px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-1">
            Meta Volatility
          </div>
          <div className={`text-2xl font-heading tracking-wider ${volatilityColor}`}>
            {volatilityLevel}
          </div>
        </div>
        <TrendingUp className={`w-8 h-8 opacity-20 ${volatilityColor}`} />
      </div>

      {/* KPI 2 */}
      <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 p-4 flex items-center justify-between rounded-lg shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] transition-colors hover:border-[#FF6A00]/30">
        <div>
          <div className="text-[10px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-1">
            Active Intelligence
          </div>
          <div className="text-2xl font-heading tracking-wider text-white">
            {stats.totalBuilds} <span className="text-sm text-gray-500 tracking-normal">BUILDS</span>
          </div>
        </div>
        <Activity className="w-8 h-8 text-white opacity-20" />
      </div>

      {/* KPI 3 */}
      <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 p-4 flex items-center justify-between rounded-lg shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] transition-colors hover:border-[#FF6A00]/30">
        <div>
          <div className="text-[10px] font-sans font-bold text-gray-500 tracking-widest uppercase mb-1">
            Omega Level Threats
          </div>
          <div className="text-2xl font-heading tracking-wider text-rose-500">
            {stats.omegaThreats} <span className="text-sm text-rose-500/50 tracking-normal">DETECTED</span>
          </div>
        </div>
        <ShieldAlert className="w-8 h-8 text-rose-500 opacity-20" />
      </div>

      {/* KPI 4 */}
      <div className="bg-[#050505]/80 backdrop-blur-md border border-[#FF6A00]/20 p-4 flex items-center justify-between rounded-lg shadow-[inset_0_0_20px_rgba(255,106,0,0.05)] relative overflow-hidden transition-colors hover:border-[#FF6A00]/50">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/10 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative z-10">
          <div className="text-[10px] font-sans font-bold text-[#FF6A00] tracking-widest uppercase mb-1 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
            System Status
          </div>
          <div className="text-[11px] font-sans text-[#FF6A00]/80 uppercase mt-2">
            SYNC: {new Date(generatedAt).toLocaleTimeString()}
          </div>
        </div>
        <Crosshair className="w-8 h-8 text-[#FF6A00] opacity-30 relative z-10 animate-spin-slow" />
      </div>

    </div>
  );
}
