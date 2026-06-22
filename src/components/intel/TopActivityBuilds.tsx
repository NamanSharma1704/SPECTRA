import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface TopActivityEntry {
  activity: { id: string; name: string; type: string };
  top: {
    status: "AVAILABLE" | "NO_DATA" | "INSUFFICIENT_EVIDENCE";
    build?: { id: string; name: string; archetype: string | null; creators: { name: string } | null };
    score?: number;
    threat?: string;
  };
}

const TYPE_COLORS: Record<string, string> = {
  MISSION:    "border-cyan-500/20 bg-cyan-500/5",
  ENDGAME:    "border-orange-500/20 bg-orange-500/5",
  OPEN_WORLD: "border-green-500/20 bg-green-500/5",
  PVP:        "border-red-500/20 bg-red-500/5",
};

const TYPE_ACCENT: Record<string, string> = {
  MISSION:    "text-cyan-400",
  ENDGAME:    "text-orange-400",
  OPEN_WORLD: "text-green-400",
  PVP:        "text-red-400",
};

export function TopActivityBuilds({ entries }: { entries: TopActivityEntry[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
        <h2 className="text-sm font-sans font-bold text-gray-300 tracking-widest uppercase">
          Today's Top Build Per Activity
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {entries.map(({ activity, top }) => {
          const border = TYPE_COLORS[activity.type] ?? "border-white/5 bg-black/20";
          const accent = TYPE_ACCENT[activity.type] ?? "text-gray-400";
          const slug = activity.name.toLowerCase().replace(/ /g, "-");

          return (
            <div key={activity.id} className={`glass-card glass-card-hover p-6 relative group ${border}`}>
              {/* Activity label */}
              <div className={`text-[10px] font-sans font-bold tracking-widest mb-2 ${accent}`}>
                {activity.type}
              </div>
              <div className="text-sm font-sans font-medium text-gray-300 mb-4 line-clamp-1">
                {activity.name}
              </div>

              {top.status === "AVAILABLE" && top.build && top.score !== undefined ? (
                <>
                  {/* Score */}
                  <div className={`text-4xl font-black font-mono ${accent} mb-1 neon-text`}>
                    {Math.round(top.score)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-sans tracking-wider mb-4">META SCORE</div>

                  {/* Build */}
                  <Link
                    href={`/builds/${top.build.id}`}
                    className="block text-[11px] font-mono text-gray-300 hover:text-white truncate group-hover:underline"
                  >
                    {top.build.name}
                  </Link>
                  <div className="text-[9px] text-gray-600 font-mono mt-0.5">
                    {top.build.creators?.name ?? "UNKNOWN"}
                  </div>

                  {/* Link to activity */}
                  <Link
                    href={`/activities/${slug}`}
                    className={`mt-3 text-[9px] font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${accent}`}
                  >
                    VIEW LEADERBOARD <ArrowUpRight className="w-2.5 h-2.5" />
                  </Link>
                </>
              ) : (
                <div className="text-xs text-gray-700 font-mono">
                  {top.status === "INSUFFICIENT_EVIDENCE" ? "INSUFFICIENT EVIDENCE" : "NO DATA"}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
