import { Target, CheckCircle2 } from "lucide-react";

interface Forecaster {
  id: string;
  name: string;
  isVerified: boolean;
  trustScoreState: any;
  trustTier: string;
  hybridAccuracyState: any;
  successfulCalls: number;
  avgLeadTimeState: any;
}

export function TopForecastersPanel({ forecasters }: { forecasters: Forecaster[] }) {
  if (!forecasters || forecasters.length === 0) return null;

  return (
    <div className="border border-green-900/30 bg-black/40">
      <div className="bg-green-950/20 p-4 border-b border-green-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-green-500" />
          <h2 className="text-sm font-mono font-bold text-green-500 tracking-widest uppercase">
            Top Forecasters
          </h2>
        </div>
        <div className="text-[10px] font-mono text-green-500/50 uppercase tracking-widest">
          Accuracy Leaderboard
        </div>
      </div>

      <div className="divide-y divide-gray-900">
        {forecasters.map((f, i) => (
          <div key={f.id} className="p-4 flex items-center gap-4 hover:bg-gray-900/30 transition-colors">
            <div className="text-green-500 font-black font-mono text-xl opacity-50 w-6">#{i + 1}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-200">{f.name}</span>
                {f.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 ${
                  f.trustTier === "ELITE" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                  f.trustTier === "HIGH" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" :
                  "bg-gray-800 text-gray-400"
                }`}>{f.trustTier}</span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Accuracy</div>
                  <div className="font-mono text-sm text-green-400">
                    {f.hybridAccuracyState.status === "AVAILABLE" ? `${f.hybridAccuracyState.accuracy}%` : f.hybridAccuracyState.status === "INSUFFICIENT_EVIDENCE" ? "NEEDS DATA" : "NO DATA"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Successes</div>
                  <div className="font-mono text-sm text-gray-300">{f.successfulCalls} calls</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Lead Time</div>
                  <div className="font-mono text-sm text-cyan-400">
                    {f.avgLeadTimeState.status === "AVAILABLE" ? `${f.avgLeadTimeState.leadTime} days` : "NO DATA"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
