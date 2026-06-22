import { Target, TrendingUp, CheckCircle, XCircle } from "lucide-react";

interface ForecastingStats {
  trustTier: string;
  hybridAccuracyState: any;
  successfulCalls: number;
  emergingCalls: number;
  avgLeadTimeState: any;
}

export function ForecastingStatisticsPanel({ stats }: { stats: ForecastingStats }) {
  if (!stats) return null;

  const failedCalls = Math.max(0, stats.emergingCalls - stats.successfulCalls);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "ELITE": return "text-green-400";
      case "HIGH": return "text-blue-400";
      case "MEDIUM": return "text-yellow-400";
      default: return "text-gray-400";
    }
  };

  const getTierBg = (tier: string) => {
    switch (tier) {
      case "ELITE": return "bg-green-500/20";
      case "HIGH": return "bg-blue-500/20";
      case "MEDIUM": return "bg-yellow-500/20";
      default: return "bg-gray-800";
    }
  };

  return (
    <div className="border border-green-900/30 bg-black/40">
      <div className="bg-green-950/20 p-4 border-b border-green-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-mono font-bold text-green-500 tracking-widest uppercase">
            Forecasting Statistics
          </h2>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Trust Tier</div>
            <div className={`font-mono text-lg font-black tracking-widest ${getTierColor(stats.trustTier)}`}>
              {stats.trustTier || "UNRATED"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Hybrid Accuracy</div>
            <div className="font-mono text-2xl font-black text-white">
              {stats.hybridAccuracyState?.status === "AVAILABLE" ? `${stats.hybridAccuracyState.accuracy}%` : "NO DATA"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-900">
          <div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 uppercase mb-1">
              <CheckCircle className="w-3 h-3 text-green-500" /> Successful Calls
            </div>
            <div className="font-mono text-lg font-bold text-gray-200">{stats.successfulCalls}</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-gray-500 uppercase mb-1">
              <XCircle className="w-3 h-3 text-red-500" /> Failed Calls
            </div>
            <div className="font-mono text-lg font-bold text-gray-200">{failedCalls}</div>
          </div>
        </div>

        <div className="bg-gray-900/50 p-3 flex items-center justify-between border border-gray-800">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Avg. Lead Time
          </div>
          <div className="font-mono text-sm font-bold text-cyan-400">
            {stats.avgLeadTimeState?.status === "AVAILABLE" ? `${stats.avgLeadTimeState.leadTime} Days` : "NO DATA"}
          </div>
        </div>
      </div>
    </div>
  );
}
