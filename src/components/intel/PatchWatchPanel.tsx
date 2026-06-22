import { ShieldCheck, AlertTriangle, Zap } from "lucide-react";

interface PatchItem {
  item: string;
  status: "STABLE" | "WATCH" | "BUFFED" | "NERFED";
  change: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

const STATUS_CONFIG = {
  STABLE:  { icon: ShieldCheck,    color: "text-gray-400",    border: "border-gray-800",      bg: "bg-transparent",       badge: "bg-gray-800 text-gray-400" },
  WATCH:   { icon: AlertTriangle,  color: "text-yellow-400",  border: "border-yellow-800/50", bg: "bg-yellow-950/10",     badge: "bg-yellow-900/40 text-yellow-400" },
  BUFFED:  { icon: Zap,            color: "text-cyan-400",    border: "border-cyan-700/50",   bg: "bg-cyan-950/10",       badge: "bg-cyan-900/40 text-cyan-400" },
  NERFED:  { icon: AlertTriangle,  color: "text-red-500",     border: "border-red-800/50",    bg: "bg-red-950/10",        badge: "bg-red-900/40 text-red-400" },
};

export function PatchWatchPanel({ items }: { items: PatchItem[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1 h-4 bg-yellow-500 inline-block" />
        <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">Patch Watch</h2>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          <span className="text-[10px] font-mono text-yellow-500">MONITORING ACTIVE</span>
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item) => {
          const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.STABLE;
          const Icon = cfg.icon;
          return (
            <div
              key={item.item}
              className={`flex items-center gap-4 border px-4 py-3 ${cfg.border} ${cfg.bg}`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="font-mono font-bold text-sm text-white truncate">{item.item}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-0.5">{item.change}</div>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 flex-shrink-0 ${cfg.badge}`}>
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
