import Link from "next/link";
import { PlayCircle, Target, Users, TrendingUp } from "lucide-react";
import { IntelligenceContribution } from "@/types/intelligence";

export function CreatorIntelligenceContributions({ contributions }: { contributions: IntelligenceContribution[] }) {
  return (
    <div className="border border-gray-800 bg-black/40 p-5 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-primary inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Intelligence Contributions
        </h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">{contributions.length} CONTRIBUTIONS</span>
      </div>

      {contributions.length === 0 ? (
        <div className="text-gray-700 text-xs font-mono text-center py-6">NO CONTRIBUTIONS ON RECORD</div>
      ) : (
        <div className="space-y-3">
          {contributions.map((contrib) => {
            const roleColor =
              contrib.role === "ORIGINATOR" ? "text-primary border-primary/30 bg-primary/10" :
              contrib.role === "EVOLVER" ? "text-blue-400 border-blue-400/30 bg-blue-400/10" :
              "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";

            return (
              <div key={contrib.sourceId} className="border border-gray-800 bg-black/20 p-4 hover:border-primary/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-4">
                    <Link
                      href={`/builds/${contrib.buildId}/sources/${contrib.sourceId}`}
                      className="font-mono font-bold text-sm text-white group-hover:text-primary transition-colors block truncate mb-1"
                    >
                      {contrib.sourceTitle}
                    </Link>
                    <div className="text-[10px] font-mono text-gray-500 truncate flex items-center gap-2">
                      <PlayCircle className="w-3 h-3" />
                      Archetype: {contrib.buildName}
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 text-[9px] font-mono font-bold border flex-shrink-0 ${roleColor}`}>
                    [{contrib.role}]
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800/50">
                  <div>
                    <div className="text-[9px] font-mono text-gray-600 mb-1 flex items-center gap-1">
                      <Target className="w-3 h-3" /> META IMPACT
                    </div>
                    <div className="text-[10px] font-mono text-gray-300 truncate">
                      {contrib.metaImpact}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-gray-600 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> CONSENSUS REACH
                    </div>
                    <div className="text-[10px] font-mono text-gray-300">
                      {contrib.consensusReach} Analysts
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-mono text-gray-600 mb-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> FORECAST ACCURACY
                    </div>
                    <div className="text-[10px] font-mono text-gray-300">
                      {contrib.forecastAccuracy}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
