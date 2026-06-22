import Link from "next/link";

interface ActivityDiff {
  activity: string;
  type: string;
  scoreA: number;
  scoreB: number;
  tierA: string;
  tierB: string;
  delta: number;
  winner: "A" | "B" | "TIE";
}

const TIER_COLORS: Record<string, string> = {
  S: "text-cyan-400",
  A: "text-orange-400",
  B: "text-yellow-400",
  C: "text-gray-400",
  D: "text-red-700",
};

function TierBadge({ tier, score }: { tier: string; score: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`text-2xl font-black font-mono ${TIER_COLORS[tier] ?? "text-gray-500"}`}>{tier}</span>
      <span className="text-[10px] text-gray-600 font-mono">{score}</span>
    </div>
  );
}

export function ActivityDiffMatrix({ diffs }: { diffs: ActivityDiff[] }) {
  return (
    <div className="border border-gray-800 bg-black/40 p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-orange-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Activity Differential Matrix
        </h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">
          ALPHA <span className="text-cyan-400">■</span> · BRAVO <span className="text-orange-400">■</span>
        </span>
      </div>

      <div className="space-y-2">
        {diffs.map((diff) => {
          const deltaAbs = Math.abs(diff.delta);
          const barMax = 100;

          return (
            <div key={diff.activity} className="group">
              {/* Activity name + type */}
              <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                <span className="text-gray-500">{diff.activity}</span>
                <span className="text-gray-700">{diff.type}</span>
              </div>

              {/* Comparison row */}
              <div className="flex items-center gap-3">
                {/* Alpha score + tier */}
                <TierBadge tier={diff.tierA} score={diff.scoreA} />

                {/* Dual bar */}
                <div className="flex-1 flex flex-col gap-1">
                  {/* Alpha bar (left-aligned) */}
                  <div className="h-3 bg-gray-900 flex">
                    <div
                      className={`h-full transition-all ${diff.winner === "A" ? "bg-cyan-500" : "bg-cyan-900/60"}`}
                      style={{ width: `${(diff.scoreA / barMax) * 100}%` }}
                    />
                  </div>
                  {/* Bravo bar (left-aligned) */}
                  <div className="h-3 bg-gray-900 flex">
                    <div
                      className={`h-full transition-all ${diff.winner === "B" ? "bg-orange-500" : "bg-orange-900/60"}`}
                      style={{ width: `${(diff.scoreB / barMax) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Bravo score + tier */}
                <TierBadge tier={diff.tierB} score={diff.scoreB} />

                {/* Delta indicator */}
                <div className={`w-16 text-right flex-shrink-0 font-mono font-bold text-sm ${
                  diff.winner === "A" ? "text-cyan-400" :
                  diff.winner === "B" ? "text-orange-400" : "text-gray-600"
                }`}>
                  {diff.winner === "TIE" ? "TIE" :
                   diff.winner === "A" ? `A +${deltaAbs}` : `B +${deltaAbs}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Column headers */}
      <div className="mt-4 flex items-center justify-between text-[9px] font-mono text-gray-700 border-t border-gray-900 pt-3">
        <span className="text-cyan-500/50">ALPHA ←</span>
        <span>SCORE DELTA</span>
        <span className="text-orange-500/50">→ BRAVO</span>
      </div>
    </div>
  );
}
