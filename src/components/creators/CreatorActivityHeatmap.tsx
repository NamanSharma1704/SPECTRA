import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface ActivityPerf {
  name: string;
  type: string;
  avgScore: number;
  buildCount: number;
}

const TYPE_COLORS: Record<string, { bar: string; text: string; border: string }> = {
  MISSION:    { bar: "bg-cyan-500",  text: "text-cyan-400",  border: "border-cyan-700/30" },
  ENDGAME:    { bar: "bg-orange-500", text: "text-orange-400", border: "border-orange-700/30" },
  OPEN_WORLD: { bar: "bg-green-500", text: "text-green-400", border: "border-green-700/30" },
  PVP:        { bar: "bg-red-600",   text: "text-red-400",   border: "border-red-800/30" },
};

export function CreatorActivityHeatmap({ activities }: { activities: ActivityPerf[] }) {
  const maxScore = Math.max(...activities.map((a) => a.avgScore), 1);

  return (
    <div className="border border-gray-800 bg-black/40 p-5">
      <div className="flex items-center gap-2 mb-5">
        <span className="w-1 h-4 bg-cyan-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
          Activity Performance Heatmap
        </h2>
        <span className="text-[10px] font-mono text-gray-700 ml-auto">AVG ACROSS ALL BUILDS</span>
      </div>

      <div className="space-y-2">
        {activities.map((act) => {
          const cfg = TYPE_COLORS[act.type] ?? { bar: "bg-gray-600", text: "text-gray-400", border: "border-gray-700" };
          const width = (act.avgScore / maxScore) * 100;
          const slug = act.name.toLowerCase().replace(/ /g, "-");

          return (
            <Link
              key={act.name}
              href={`/activities/${slug}`}
              className={`flex items-center gap-3 border ${cfg.border} bg-black/20 px-4 py-2 hover:opacity-80 transition-opacity group`}
            >
              <div className={`text-[9px] font-mono font-bold ${cfg.text} w-20 flex-shrink-0`}>
                {act.type}
              </div>
              <div className="text-[11px] font-mono text-gray-300 w-32 flex-shrink-0 truncate">
                {act.name}
              </div>
              <div className="flex-1 h-4 bg-gray-900 overflow-hidden">
                <div className={`h-full ${cfg.bar} opacity-70`} style={{ width: `${width}%` }} />
              </div>
              <div className={`text-sm font-black font-mono ${cfg.text} flex-shrink-0 w-10 text-right`}>
                {act.avgScore}
              </div>
              <ArrowUpRight className={`w-3 h-3 ${cfg.text} opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0`} />
            </Link>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-gray-700 text-xs font-mono text-center py-4">NO ACTIVITY DATA</div>
      )}
    </div>
  );
}
