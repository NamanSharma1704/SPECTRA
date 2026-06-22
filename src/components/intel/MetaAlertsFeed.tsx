import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ShieldAlert } from "lucide-react";

interface MetaAlert {
  rank: number;
  id: string;
  name: string;
  archetype: string | null;
  creator: string;
  peakScore: number;
  velocity: "RISING" | "FALLING" | "STABLE";
  threat: string;
}

const VELOCITY_CONFIG = {
  RISING: {
    icon: TrendingUp,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10 border-cyan-400/20",
    label: "▲ RISING",
  },
  FALLING: {
    icon: TrendingDown,
    color: "text-red-500",
    bg: "bg-red-900/10 border-red-800/20",
    label: "▼ FALLING",
  },
  STABLE: {
    icon: Minus,
    color: "text-gray-500",
    bg: "bg-gray-900/20 border-gray-800",
    label: "— STABLE",
  },
};

export function MetaAlertsFeed({ alerts }: { alerts: MetaAlert[] }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1.5 h-6 rounded-full bg-primary shadow-[0_0_10px_rgba(255,106,0,0.8)]" />
        <h2 className="text-sm font-sans font-bold text-gray-300 tracking-widest uppercase">
          Meta Alerts
        </h2>
        <span className="ml-auto text-[10px] font-sans font-bold text-gray-500 bg-white/5 px-3 py-1 rounded-full">
          {alerts.filter((a) => a.velocity === "RISING").length} RISING ·{" "}
          {alerts.filter((a) => a.velocity === "FALLING").length} FALLING
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const cfg = VELOCITY_CONFIG[alert.velocity];
          const Icon = cfg.icon;
          return (
            <Link
              key={alert.id}
              href={`/builds/${alert.id}`}
              className={`flex items-center gap-4 glass-card glass-card-hover px-5 py-4 transition-all group border-white/5`}
            >
              {/* Rank */}
              <span className="text-2xl font-black font-mono text-white/20 w-8 flex-shrink-0 group-hover:text-primary/50 transition-colors">
                {alert.rank}
              </span>

              {/* Build info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-white text-sm group-hover:text-primary transition-colors truncate">
                    {alert.name}
                  </span>
                  {alert.threat === "OMEGA" && (
                    <ShieldAlert className="w-3 h-3 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                  [{alert.archetype}] · {alert.creator}
                </div>
              </div>

              {/* Peak score */}
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-lg font-black font-mono text-primary">{alert.peakScore}</span>
                <span className="text-[9px] text-gray-600 font-mono">PEAK META</span>
              </div>

              {/* Velocity */}
              <div className={`flex items-center gap-1 text-[10px] font-mono font-bold ${cfg.color} flex-shrink-0 w-20 justify-end`}>
                <Icon className="w-3 h-3" />
                {cfg.label.split(" ")[1]}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
