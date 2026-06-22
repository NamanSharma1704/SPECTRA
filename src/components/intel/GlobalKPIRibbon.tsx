import { ShieldAlert, RefreshCcw } from "lucide-react";

export function GlobalKPIRibbon({ stats, generatedAt }: { stats: any; generatedAt: string }) {
  const volatilityScore = Math.min(100, Math.round(stats.totalBuilds / 2.5));
  const volatilityLevel = volatilityScore > 80 ? "HIGH" : volatilityScore > 50 ? "MODERATE" : "STABLE";
  const volatilityColor = volatilityLevel === "HIGH" ? "text-red-500" : volatilityLevel === "MODERATE" ? "text-[#FF6A00]" : "text-green-500";
  const volatilityStroke = volatilityLevel === "HIGH" ? "#EF4444" : volatilityLevel === "MODERATE" ? "#FF6A00" : "#22C55E";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      
      {/* 1. Meta Volatility */}
      <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg flex items-center justify-between">
        <div>
          <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-2">
            Meta Volatility
          </div>
          <div className={`text-2xl font-sans font-bold tracking-widest uppercase ${volatilityColor}`}>
            {volatilityLevel}
          </div>
        </div>
        <div className="w-20 h-8">
          <svg viewBox="0 0 100 30" className="w-full h-full opacity-60">
            <polyline fill="none" stroke={volatilityStroke} strokeWidth="1.5" points="0,25 20,20 40,28 60,10 80,15 100,5" />
          </svg>
        </div>
      </div>

      {/* 2. Active Intelligence */}
      <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg flex items-center justify-between">
        <div>
          <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-2">
            Active Intelligence
          </div>
          <div className="text-2xl font-sans font-bold tracking-widest text-white uppercase flex items-baseline gap-2">
            {stats.totalBuilds} <span className="text-xs text-gray-500 font-heading">BUILDS TRACKED</span>
          </div>
        </div>
        <div className="w-16 h-8">
          <svg viewBox="0 0 100 30" className="w-full h-full opacity-30">
            <polyline fill="none" stroke="#FFFFFF" strokeWidth="1.5" points="0,15 20,15 30,5 40,25 50,15 100,15" />
          </svg>
        </div>
      </div>

      {/* 3. Omega Level Threats */}
      <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg flex items-center justify-between">
        <div>
          <div className="text-xs font-heading font-bold text-gray-500 tracking-widest uppercase mb-2">
            Omega Level Threats
          </div>
          <div className="text-2xl font-sans font-bold tracking-widest text-red-500 uppercase flex items-baseline gap-2">
            {stats.omegaThreats} <span className="text-xs text-red-500/50 font-heading">DETECTED</span>
          </div>
        </div>
        <div className="p-1.5 border border-red-500/20 rounded-md bg-red-500/5">
          <ShieldAlert className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {/* 4. System Status */}
      <div className="bg-[#0A0A0A] border border-white/5 p-4 rounded-lg flex items-center justify-between relative overflow-hidden">
        <div>
          <div className="text-xs font-heading font-bold text-[#FF6A00] tracking-widest uppercase mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-pulse" />
            System Status
          </div>
          <div className="text-sm font-sans font-bold tracking-widest text-[#FF6A00] uppercase mt-2 flex items-baseline gap-2">
            SYNCED <span className="text-white/60" suppressHydrationWarning>{new Date(generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
          </div>
        </div>
        <RefreshCcw className="w-6 h-6 text-[#FF6A00] opacity-40 animate-spin-slow" />
      </div>

    </div>
  );
}
