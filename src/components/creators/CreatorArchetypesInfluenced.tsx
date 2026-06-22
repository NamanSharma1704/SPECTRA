import Link from "next/link";
import { ShieldAlert, Activity, GitCompare, Crosshair } from "lucide-react";

interface ArchetypeInfluenced {
  id: string;
  name: string;
  archetype: string | null;
  peakScore: number;
  avgScore: number;
  topThreat: string;
}

export function CreatorArchetypesInfluenced({ archetypes, creatorName }: { archetypes: ArchetypeInfluenced[]; creatorName: string }) {
  return (
    <div className="border border-gray-800 bg-black/40 p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-primary inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Archetypes Influenced
        </h2>
        <span className="ml-auto text-[10px] font-mono text-gray-700">{archetypes.length} ARCHETYPES</span>
      </div>

      {archetypes.length === 0 ? (
        <div className="text-gray-700 text-xs font-mono text-center py-6">NO ARCHETYPES IN DATABASE</div>
      ) : (
        <div className="space-y-2">
          {archetypes.map((archetype, i) => {
            const threatColor =
              archetype.topThreat === "OMEGA" ? "text-red-500" :
              archetype.topThreat === "ALPHA" ? "text-orange-400" : "text-gray-500";

            return (
              <div key={archetype.id} className="flex items-center gap-3 border border-gray-800 bg-black/20 px-4 py-3 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                {/* Rank */}
                <span className="text-gray-700 font-mono font-bold w-6 flex-shrink-0">#{i + 1}</span>

                {/* Archetype info */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                    {archetype.name}
                  </div>
                  <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                    [{archetype.archetype ?? "?"}]
                  </div>
                </div>

                {/* Threat */}
                <div className={`flex items-center gap-1 text-[10px] font-mono flex-shrink-0 ${threatColor}`}>
                  {archetype.topThreat === "OMEGA"
                    ? <ShieldAlert className="w-3 h-3" />
                    : <Activity className="w-3 h-3" />}
                  {archetype.topThreat}
                </div>

                {/* Scores */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-sm font-black font-mono text-primary">{archetype.peakScore}</span>
                  <span className="text-[9px] text-gray-600 font-mono">PEAK</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/compare?a=${archetype.id}`}
                    className="p-1.5 border border-gray-800 text-gray-600 hover:border-primary/40 hover:text-primary transition-all"
                    title="Compare this archetype"
                  >
                    <GitCompare className="w-3 h-3" />
                  </Link>
                  <Link
                    href={`/builds/${archetype.id}`}
                    className="flex items-center gap-1 px-2 py-1 border border-primary/30 text-primary/70 hover:bg-primary hover:text-black transition-all text-[10px] font-mono"
                  >
                    <Crosshair className="w-3 h-3" /> DOSSIER
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
