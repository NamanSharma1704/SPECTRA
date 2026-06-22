import Link from "next/link";

interface BuildSummary {
  id: string;
  name: string;
  archetype: string | null;
  verdict: "DEPLOY" | "SITUATIONAL" | "AVOID";
  avgMetaScore: number;
  creators: { name: string } | null;
}

interface VerdictComparisonProps {
  buildA: BuildSummary;
  buildB: BuildSummary;
  winner: "A" | "B" | "TIE";
  stats: { activitiesWonByA: number; activitiesWonByB: number; ties: number };
}

const VERDICT_STYLE = {
  DEPLOY:      { color: "text-cyan-400",   border: "border-cyan-500/40",  bg: "bg-cyan-950/20"  },
  SITUATIONAL: { color: "text-orange-400", border: "border-orange-500/40", bg: "bg-orange-950/20" },
  AVOID:       { color: "text-red-500",    border: "border-red-700/40",    bg: "bg-red-950/10"  },
};

function BuildCard({
  build,
  label,
  labelColor,
  isWinner,
}: {
  build: BuildSummary;
  label: string;
  labelColor: string;
  isWinner: boolean;
}) {
  const vs = VERDICT_STYLE[build.verdict];
  return (
    <div className={`flex-1 border ${vs.border} ${vs.bg} p-5 relative ${isWinner ? "ring-1 ring-primary/40" : ""}`}>
      {isWinner && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-mono font-black px-3 py-0.5 tracking-widest">
          META WINNER
        </div>
      )}
      <div className={`text-[10px] font-mono tracking-widest mb-2 ${labelColor}`}>{label}</div>
      <div className="text-xl font-black font-mono text-white mb-1 leading-tight">{build.name}</div>
      <div className="text-[10px] text-gray-600 font-mono mb-4">
        [{build.archetype}] · {build.creators?.name ?? "UNKNOWN"}
      </div>

      <div className={`text-4xl font-black font-mono ${vs.color} mb-1`}>{build.verdict}</div>
      <div className="text-[10px] text-gray-600 font-mono mb-4">FIELD VERDICT</div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-black font-mono text-primary">{build.avgMetaScore}</span>
        <span className="text-[10px] text-gray-600 font-mono">AVG META SCORE</span>
      </div>

      <Link
        href={`/builds/${build.id}`}
        className="mt-4 block text-[10px] font-mono text-gray-600 hover:text-primary transition-colors"
      >
        → OPEN DOSSIER
      </Link>
    </div>
  );
}

export function VerdictComparison({ buildA, buildB, winner, stats }: VerdictComparisonProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-cyan-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Verdict Comparison
        </h2>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <BuildCard build={buildA} label="BUILD ALPHA" labelColor="text-cyan-400" isWinner={winner === "A"} />

        {/* VS divider */}
        <div className="flex md:flex-col items-center justify-center gap-2 md:gap-4 py-2 md:py-0">
          <div className="flex-1 h-px md:w-px md:h-full bg-gray-800 md:bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
          <div className="flex-shrink-0 text-gray-600 font-mono text-xs font-bold px-2">VS</div>
          <div className="flex-1 h-px md:w-px md:h-full bg-gray-800 md:bg-gradient-to-b from-transparent via-gray-700 to-transparent" />
        </div>

        <BuildCard build={buildB} label="BUILD BRAVO" labelColor="text-orange-400" isWinner={winner === "B"} />
      </div>

      {/* Activity wins summary */}
      <div className="mt-4 flex gap-4 text-[10px] font-mono">
        <div className="flex-1 border border-cyan-800/30 bg-cyan-950/10 p-3 text-center">
          <div className="text-2xl font-black text-cyan-400">{stats.activitiesWonByA}</div>
          <div className="text-gray-600 mt-0.5">ALPHA WINS</div>
        </div>
        <div className="flex-1 border border-gray-800 bg-black/20 p-3 text-center">
          <div className="text-2xl font-black text-gray-500">{stats.ties}</div>
          <div className="text-gray-600 mt-0.5">TIES</div>
        </div>
        <div className="flex-1 border border-orange-800/30 bg-orange-950/10 p-3 text-center">
          <div className="text-2xl font-black text-orange-400">{stats.activitiesWonByB}</div>
          <div className="text-gray-600 mt-0.5">BRAVO WINS</div>
        </div>
      </div>
    </div>
  );
}
