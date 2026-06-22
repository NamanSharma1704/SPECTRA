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
    <div className="bg-[#0A0A0A] border border-white/5 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-500" />
          <h2 className="text-[11px] font-heading font-bold text-white tracking-widest uppercase">
            Top Analysts
          </h2>
        </div>
        <div className="text-[9px] font-sans text-gray-500 uppercase tracking-widest">
          Accuracy Leaderboard
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 divide-y divide-white/5">
        {forecasters.map((f, i) => (
          <div key={f.id} className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
            <div className="text-gray-600 font-heading text-lg opacity-50 w-4">#{i + 1}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-bold text-gray-200">{f.name}</span>
                  {f.isVerified && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                </div>
                <div className={`text-[9px] font-heading px-1.5 py-0.5 rounded border ${
                  f.trustTier === "ELITE" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                  f.trustTier === "HIGH" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                  "bg-white/5 text-gray-400 border-white/10"
                }`}>{f.trustTier}</div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <div className="text-[9px] font-heading text-gray-500 uppercase tracking-widest">Accuracy</div>
                  <div className={`font-sans text-xs font-bold ${f.hybridAccuracyState.status === "AVAILABLE" && f.hybridAccuracyState.accuracy > 70 ? 'text-green-500' : 'text-gray-300'}`}>
                    {f.hybridAccuracyState.status === "AVAILABLE" ? `${f.hybridAccuracyState.accuracy}%` : "---"}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-heading text-gray-500 uppercase tracking-widest">Successes</div>
                  <div className="font-sans text-xs font-bold text-gray-300">{f.successfulCalls}</div>
                </div>
                <div>
                  <div className="text-[9px] font-heading text-gray-500 uppercase tracking-widest">Score</div>
                  <div className="font-sans text-xs font-bold text-blue-500">
                    {f.trustScoreState.status === "AVAILABLE" ? f.trustScoreState.trustScore : "---"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full p-3 text-center text-[10px] font-heading text-gray-500 tracking-widest uppercase border-t border-white/5 hover:bg-white/5 hover:text-white transition-colors">
        VIEW FULL LEADERBOARD
      </button>
    </div>
  );
}
