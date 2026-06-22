import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";

interface EmergingBuild {
  id: string;
  name: string;
  archetype: string | null;
  avgScore: number;
  creator: string;
}

export function EmergingBuildsPanel({ builds }: { builds: EmergingBuild[] }) {
  if (!builds || builds.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(255,106,0,0.8)]" />
        <h2 className="text-sm font-sans font-bold text-gray-300 tracking-widest uppercase">
          Emerging Builds
        </h2>
        <span className="ml-2 text-[10px] font-sans font-bold text-orange-500/70 bg-orange-500/10 px-2 py-1 rounded-md border border-orange-500/20">// GAINING MOMENTUM</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {builds.map((build) => (
          <Link
            key={build.id}
            href={`/builds/${build.id}`}
            className="group relative glass-card glass-card-hover p-5 transition-all overflow-hidden border-white/5"
          >
            {/* Glow */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all" />

            <div className="flex items-start justify-between gap-2 relative z-10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 bg-orange-500/10 w-fit px-2 py-1 rounded-md border border-orange-500/20">
                  <Flame className="w-3 h-3 text-orange-400 flex-shrink-0" />
                  <span className="text-[10px] font-sans font-bold text-orange-400 tracking-widest">
                    EMERGING
                  </span>
                </div>
                <div className="font-sans font-bold text-white text-lg group-hover:text-orange-300 transition-colors truncate">
                  {build.name}
                </div>
                <div className="text-[10px] text-gray-400 font-sans mt-1">
                  [{build.archetype}] · {build.creator}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-3xl font-black font-mono text-orange-400 neon-text">{build.avgScore}</div>
                <div className="text-[9px] text-gray-500 font-sans tracking-wider mt-1">AVG META</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-end">
              <span className="text-[10px] font-sans font-bold text-gray-500 group-hover:text-orange-400 flex items-center gap-1 transition-colors">
                INSPECT DOSSIER <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
