interface ActivityScoreBarsProps {
  activities: {
    name: string;
    score: number;
    tier: string;
  }[];
}

function getTierColor(tier: string) {
  switch (tier) {
    case "S": return { bar: "bg-cyan-400", text: "text-cyan-400", glow: "shadow-[0_0_8px_rgba(34,211,238,0.5)]" };
    case "A": return { bar: "bg-orange-400", text: "text-orange-400", glow: "shadow-[0_0_8px_rgba(255,106,0,0.5)]" };
    case "B": return { bar: "bg-yellow-400", text: "text-yellow-400", glow: "" };
    case "C": return { bar: "bg-gray-500", text: "text-gray-400", glow: "" };
    default:  return { bar: "bg-red-900",  text: "text-red-700",  glow: "" };
  }
}

export function ActivityScoreBars({ activities }: ActivityScoreBarsProps) {
  const maxScore = Math.max(...activities.map((a) => a.score), 1);

  return (
    <div className="space-y-3">
      {activities.map((act) => {
        const { bar, text, glow } = getTierColor(act.tier);
        const width = (act.score / maxScore) * 100;

        return (
          <div key={act.name} className="flex items-center gap-3 group">
            {/* Tier badge */}
            <div className={`w-6 text-center text-xs font-black font-mono flex-shrink-0 ${text}`}>
              {act.tier}
            </div>

            {/* Activity name */}
            <div className="w-32 flex-shrink-0 text-[11px] font-mono text-gray-400 truncate group-hover:text-gray-200 transition-colors">
              {act.name}
            </div>

            {/* Bar */}
            <div className="flex-1 h-5 bg-gray-900 border border-gray-800 relative overflow-hidden">
              <div
                className={`h-full ${bar} ${glow} transition-all duration-700 ease-out`}
                style={{ width: `${width}%`, opacity: 0.85 }}
              />
              {/* Score overlay */}
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold ${text}`}>
                {act.score.toFixed(0)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
