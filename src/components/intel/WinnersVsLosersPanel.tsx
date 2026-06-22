import { TrendingUp, TrendingDown, Target, AlertTriangle, ShieldCheck } from "lucide-react";

interface CausalityItem {
  slug: string;
  displayName: string;
  growthPercent: number;
  patchCorrelation: string;
  confidence: number;
  reason: string;
  attributionStrength: string;
}

export function WinnersVsLosersPanel({ winners, losers }: { winners: CausalityItem[], losers: CausalityItem[] }) {
  if (!winners?.length && !losers?.length) return null;

  const ItemRow = ({ item, isWinner }: { item: CausalityItem, isWinner: boolean }) => (
    <div className={`p-5 mb-4 glass-card glass-card-hover ${isWinner ? "border-green-500/20" : "border-red-500/20"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isWinner ? "bg-green-500/10" : "bg-red-500/10"}`}>
            {isWinner ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
          </div>
          <span className="font-sans text-lg font-bold text-white tracking-wide">{item.displayName}</span>
        </div>
        <div className={`font-mono text-2xl font-black ${isWinner ? "text-green-400 neon-text" : "text-red-400"}`}>
          {item.growthPercent > 0 ? "+" : ""}{item.growthPercent}%
        </div>
      </div>

      <div className="rounded-xl bg-black/40 p-4 border border-white/5 shadow-inner">
        <div className="flex items-center gap-2 text-[10px] font-sans font-bold text-gray-400 mb-2 uppercase tracking-widest">
          <Target className="w-3 h-3" /> Patch Reason
        </div>
        <div className="font-sans text-sm text-gray-200 leading-relaxed">
          {item.reason}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10">
        <div>
          <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-1.5">Correlation</div>
          <div className={`font-mono text-sm font-bold flex items-center gap-1.5 ${
            item.patchCorrelation === "HIGH" ? "text-green-400" : 
            item.patchCorrelation === "CONTRADICTORY" ? "text-red-400" : "text-yellow-400"
          }`}>
            {item.patchCorrelation === "CONTRADICTORY" && <AlertTriangle className="w-3 h-3" />}
            {item.patchCorrelation}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-1.5">Confidence Score</div>
          <div className="font-mono text-sm font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className={`w-3.5 h-3.5 ${item.confidence > 80 ? "text-primary" : "text-gray-500"}`} />
            {item.confidence}%
            <span className="text-[10px] text-gray-500 ml-1 font-sans">({item.attributionStrength})</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-black font-sans text-green-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" /> Winners
        </h2>
        {winners?.length > 0 ? (
          winners.map(w => <ItemRow key={w.slug} item={w} isWinner={true} />)
        ) : (
          <div className="glass-card p-6 text-center font-sans text-gray-500 text-sm">
            No significant winners detected.
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-black font-sans text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" /> Losers
        </h2>
        {losers?.length > 0 ? (
          losers.map(l => <ItemRow key={l.slug} item={l} isWinner={false} />)
        ) : (
          <div className="glass-card p-6 text-center font-sans text-gray-500 text-sm flex items-center justify-center h-[120px]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              No significant decliners detected
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
