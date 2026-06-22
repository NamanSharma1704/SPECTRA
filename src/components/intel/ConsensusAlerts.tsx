import { Flame } from "lucide-react";

interface ConsensusSignal {
  display: string;
  creatorCount: number;
  videoCount: number;
}

export function ConsensusAlerts({ alerts }: { alerts: ConsensusSignal[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-orange-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Consensus Alerts</h2>
        <span className="ml-auto text-[10px] font-mono text-gray-600">INDEPENDENT AGREEMENT</span>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 4).map((alert) => (
          <div key={alert.display} className="flex items-center gap-4 glass-card glass-card-hover border-primary/20 px-4 py-3 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-full group-hover:bg-primary/20 transition-colors">
              <Flame className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-sans font-bold text-sm text-white truncate">{alert.display}</div>
              <div className="text-[10px] font-sans text-gray-400 mt-0.5">
                {alert.creatorCount} creators this week
              </div>
            </div>
            <span className="text-[9px] font-sans font-bold px-2 py-1 rounded-md bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(255,106,0,0.2)]">
              STRONG
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
