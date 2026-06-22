import { Shield, Sparkles, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";

export function ForecastCard({ forecast }: { forecast: any }) {
  
  // Format the taxonomy slug into a readable name
  const readableName = forecast.slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const stageConfig: Record<string, { color: string; icon: any; label: string }> = {
    Emerging: { color: "text-orange-400 border-orange-400/20 bg-orange-400/10", icon: Sparkles, label: "🔥 Emerging" },
    Established: { color: "text-cyan-400 border-cyan-400/20 bg-cyan-400/10", icon: Shield, label: "⭐ Established" },
    Dominant: { color: "text-purple-400 border-purple-400/20 bg-purple-400/10", icon: Target, label: "👑 Dominant" },
    Declining: { color: "text-gray-400 border-gray-400/20 bg-gray-400/10", icon: TrendingDown, label: "↓ Declining" },
    Dead: { color: "text-red-900 border-red-900/20 bg-red-900/10", icon: TrendingDown, label: "💀 Dead" }
  };

  const config = stageConfig[forecast.stage] || stageConfig.Established;
  const Icon = config.icon;

  return (
    <div className="relative group overflow-hidden bg-black/40 border border-gray-800 rounded-lg p-5 backdrop-blur-xl transition-all hover:border-gray-600">
      
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 blur-3xl rounded-full ${config.color.split(' ')[0]}`} />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white uppercase">{readableName}</h3>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-1">
            {forecast.domain_type.replace('_', ' ')}
          </div>
        </div>
        <div className={`px-2 py-1 rounded border text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 ${config.color}`}>
          {config.label}
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-5 relative z-10">
        <div className="flex items-end gap-2 mb-1">
          <span className="text-3xl font-black font-mono text-white tracking-tighter">
            {forecast.confidence_score}%
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase pb-1">
            Confidence
          </span>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${config.color.split(' ')[0].replace('text-', 'bg-')}`} 
            style={{ width: `${forecast.confidence_score}%` }} 
          />
        </div>
      </div>

      {/* Reason Breakdown */}
      <div className="mb-5 relative z-10">
        <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase mb-2">
          Intelligence Breakdown
        </div>
        <ul className="space-y-1">
          <li className="text-xs font-mono flex items-start gap-2 text-gray-300">
            ✓ {forecast.supporting_creators_count} Supporting Creators
          </li>
          <li className="text-xs font-mono flex items-start gap-2 text-gray-300">
            ✓ {forecast.elite_analyst_count} Elite/High-Trust Analysts
          </li>
          {forecast.stage !== "Dead" ? (
            <li className="text-xs font-mono flex items-start gap-2 text-gray-300">
              {forecast.growth_metric > 0 ? "✓" : forecast.growth_metric < 0 ? "✓" : "✓"} {forecast.forecast_direction} ({forecast.growth_metric > 0 ? '+' : ''}{forecast.growth_metric}% MoM)
            </li>
          ) : (
            <li className="text-xs font-mono flex items-start gap-2 text-red-400">
              ✓ No mentions in 120+ Days
            </li>
          )}
        </ul>
      </div>

      {/* Supporting Creators */}
      <div className="relative z-10 border-t border-gray-800 pt-4 mt-4">
        <div className="text-[10px] text-gray-600 font-mono tracking-widest uppercase mb-3">
          Supported By
        </div>
        {forecast.supporting_creators && forecast.supporting_creators.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {forecast.supporting_creators.map((creator: any) => (
              <div 
                key={creator.id} 
                className={`px-2 py-1 rounded text-[10px] font-mono border ${
                  creator.trustTier === 'ELITE' 
                    ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' 
                    : creator.trustTier === 'HIGH'
                    ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10'
                    : 'border-gray-700 text-gray-400 bg-gray-800/50'
                }`}
              >
                {creator.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-600 font-mono italic">No supporting creators indexed.</div>
        )}
      </div>

    </div>
  );
}
