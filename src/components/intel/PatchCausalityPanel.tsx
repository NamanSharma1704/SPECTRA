import { ShieldCheck, Target, TrendingDown, TrendingUp } from "lucide-react";

interface PatchChange {
  changeType: string;
  description: string;
  patchName: string;
  releaseDate: string;
}

export function PatchCausalityPanel({ changes }: { changes: PatchChange[] }) {
  if (!changes || changes.length === 0) return null;

  // For Hubs, we just want to show the most recent change
  const latestChange = changes[0];
  const isBuff = latestChange.changeType === "BUFF";
  const isNerf = latestChange.changeType === "NERF";

  return (
    <div className={`border p-5 mb-6 ${
      isBuff ? "border-green-900/30 bg-green-950/10" : 
      isNerf ? "border-red-900/30 bg-red-950/10" : "border-yellow-900/30 bg-yellow-950/10"
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isBuff ? <TrendingUp className="w-5 h-5 text-green-500" /> : 
           isNerf ? <TrendingDown className="w-5 h-5 text-red-500" /> : 
           <Target className="w-5 h-5 text-yellow-500" />}
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">
            Recent Patch Impact
          </span>
        </div>
        <div className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">
          {latestChange.patchName}
        </div>
      </div>

      <div className="bg-black/50 border border-gray-800 p-3 mb-3">
        <div className="text-xs font-mono text-gray-400 mb-1">
          <span className={`font-bold ${isBuff ? "text-green-500" : isNerf ? "text-red-500" : "text-yellow-500"}`}>
            {latestChange.changeType}: 
          </span> {latestChange.description}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          Attribution Strength
        </div>
        <div className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          STRONG
        </div>
      </div>
    </div>
  );
}
