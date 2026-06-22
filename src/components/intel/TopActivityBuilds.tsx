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
  MISSION:    "border-t-cyan-500/50",
  ENDGAME:    "border-t-orange-500/50",
  OPEN_WORLD: "border-t-green-500/50",
  PVP:        "border-t-red-500/50",
};

const TYPE_ACCENT: Record<string, string> = {
  MISSION:    "text-cyan-400",
  ENDGAME:    "text-orange-400",
  OPEN_WORLD: "text-green-400",
  PVP:        "text-red-400",
};

export function TopActivityBuilds({ entries }: { entries: TopActivityEntry[] }) {
  // Try to force 5 columns if there are 5 entries, else use auto-fit
  const colsClass = entries.length === 5 ? "grid-cols-5" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <section className="bg-transparent p-0 border-0 shadow-none">
      <div className="mb-4">
        <h2 className="text-xl font-heading font-bold text-white tracking-widest uppercase">
          Activity Intelligence Matrix
        </h2>
        <p className="text-[11px] font-sans text-gray-500 uppercase tracking-widest mt-1">
          Top performing builds by activity and current meta impact
        </p>
      </div>

      <div className={`grid ${colsClass} gap-4`}>
        {entries.map(({ activity, top }) => {
          const border = TYPE_COLORS[activity.type] ?? "border-t-white/20 bg-[#0A0A0A]";
          const accent = TYPE_ACCENT[activity.type] ?? "text-gray-400";
          const slug = activity.name.toLowerCase().replace(/ /g, "-");
          
          // Derive a mock confidence out of 5 based on score for visual flair, or default to 3
          const confScore = top.score ? Math.min(5, Math.max(1, Math.round(top.score / 20))) : 0;
          const dots = "●".repeat(confScore) + "○".repeat(5 - confScore);

          return (
            <div key={activity.id} className={`bg-[#0A0A0A] border border-white/5 border-t-[3px] rounded-lg p-4 relative group transition-colors hover:border-white/10 ${border}`}>
              
              {/* Header */}
              <div className="mb-4">
                <div className={`text-xs font-heading font-bold tracking-widest uppercase ${accent}`}>
                  {activity.type.replace("_", " ")}
                </div>
                <div className="text-xs font-sans text-gray-400 line-clamp-1 uppercase tracking-wider mt-1">
                  {activity.name}
                </div>
              </div>

              {top.status === "AVAILABLE" && top.build && top.score !== undefined ? (
                <>
                  {/* Meta Score & Stage */}
                  <div className="flex flex-col items-start gap-3 mb-6">
                    <div>
                      <div className="text-xs font-heading text-gray-500 tracking-widest uppercase mb-1">
                        Meta Score
                      </div>
                      <div className={`text-4xl font-sans font-bold tracking-widest ${accent}`}>
                        {Math.round(top.score)}
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 text-[10px] font-heading font-bold uppercase tracking-widest border rounded bg-opacity-10 mb-1 ${accent} border-current shrink-0`}>
                      {top.score > 90 ? "DOMINANT" : top.score > 75 ? "ESTABLISHED" : "VOLATILE"}
                    </div>
                  </div>

                  {/* Signals */}
                  <div className="space-y-4 pt-5 border-t border-white/5">
                    <div>
                      <div className="text-xs font-heading text-gray-500 tracking-widest uppercase mb-1">
                        Top Signal
                      </div>
                      <Link href={`/builds/${top.build.id}`} className="text-sm font-sans text-white hover:underline line-clamp-1">
                        {top.build.name}
                      </Link>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-heading text-gray-500 tracking-widest uppercase mb-1">
                          Analyst
                        </div>
                        <div className="text-xs font-sans text-gray-300 truncate">
                          {top.build.creators?.name ?? "UNKNOWN"}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-[10px] font-heading text-gray-500 tracking-widest uppercase mb-1">
                          Confidence
                        </div>
                        <div className={`text-xs tracking-[0.2em] ${confScore > 3 ? "text-green-500" : "text-yellow-500"}`}>
                          {dots}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="text-[10px] font-heading text-gray-600 tracking-widest uppercase">
                    {top.status === "INSUFFICIENT_EVIDENCE" ? "INSUFFICIENT DATA" : "NO DATA"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
