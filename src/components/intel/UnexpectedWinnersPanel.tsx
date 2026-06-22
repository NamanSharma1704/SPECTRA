import { Sparkles, Ghost } from "lucide-react";

interface CausalityItem {
  slug: string;
  displayName: string;
  growthPercent: number;
  patchCorrelation: string;
  confidence: number;
  reason: string;
}

export function UnexpectedWinnersPanel({ winners }: { winners: CausalityItem[] }) {
  if (!winners || winners.length === 0) return null;

  return (
    <div className="border border-purple-900/30 bg-black/40 mt-8">
      <div className="bg-purple-950/20 p-4 border-b border-purple-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-mono font-bold text-purple-500 tracking-widest uppercase">
            Unexpected Winners
          </h2>
        </div>
        <div className="text-[10px] font-mono text-purple-500/50 uppercase tracking-widest">
          Indirect Meta Shifts
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {winners.map(w => (
          <div key={w.slug} className="p-4 border border-purple-900/20 bg-purple-950/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-lg font-bold text-white uppercase">{w.displayName}</span>
              <span className="font-mono text-xl font-black text-purple-400">+{w.growthPercent}%</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <Ghost className="w-3 h-3 text-purple-500/50" />
              Reason: {w.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
