import { ShieldAlert, Activity, Shield } from "lucide-react";

interface ThreatAssessmentPanelProps {
  topThreat: string;
  avgConfidence: number;
  topActivity: { activities: { name: string } | null; meta_score: number } | null;
}

const THREAT_CONFIG = {
  OMEGA: {
    label: "OMEGA",
    sub: "Tier 1 meta threat. Highest operational priority.",
    color: "text-red-400",
    border: "border-red-800/50",
    bg: "bg-red-950/20",
    glow: "shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]",
    icon: ShieldAlert,
    pulse: "bg-red-500",
  },
  ALPHA: {
    label: "ALPHA",
    sub: "High-tier meta presence. Monitor for escalation.",
    color: "text-orange-400",
    border: "border-orange-700/50",
    bg: "bg-orange-950/20",
    glow: "shadow-[inset_0_0_20px_rgba(255,106,0,0.05)]",
    icon: Activity,
    pulse: "bg-orange-400",
  },
  GAMMA: {
    label: "GAMMA",
    sub: "Standard meta presence. Situationally viable.",
    color: "text-gray-400",
    border: "border-gray-700",
    bg: "bg-gray-900/30",
    glow: "",
    icon: Shield,
    pulse: "bg-gray-500",
  },
};

export function ThreatAssessmentPanel({ topThreat, avgConfidence, topActivity }: ThreatAssessmentPanelProps) {
  const cfg = THREAT_CONFIG[topThreat as keyof typeof THREAT_CONFIG] ?? THREAT_CONFIG.GAMMA;
  const Icon = cfg.icon;

  return (
    <div className={`border ${cfg.border} ${cfg.bg} ${cfg.glow} p-4`}>
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="w-1 h-3 bg-red-500 inline-block" />
        Threat Assessment
      </div>

      {/* Threat level */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <span className={`w-2 h-2 rounded-full ${cfg.pulse} animate-pulse inline-block`} />
          <span className={`absolute inset-0 w-2 h-2 rounded-full ${cfg.pulse} opacity-30 scale-150 animate-ping`} />
        </div>
        <Icon className={`w-5 h-5 ${cfg.color}`} />
        <span className={`text-2xl font-black font-mono tracking-widest ${cfg.color}`}>{cfg.label}</span>
      </div>

      <p className="text-xs text-gray-500 mb-4 leading-relaxed">{cfg.sub}</p>

      {/* Confidence bar */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[10px] font-mono text-gray-600">
          <span>INTELLIGENCE CONFIDENCE</span>
          <span className={cfg.color}>{avgConfidence.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-gray-900 overflow-hidden">
          <div
            className={`h-full ${cfg.pulse} transition-all duration-700`}
            style={{ width: `${avgConfidence}%`, opacity: 0.7 }}
          />
        </div>
      </div>

      {/* Top activity */}
      {topActivity?.activities && (
        <div className="border-t border-gray-800 pt-3 text-[10px] font-mono text-gray-500">
          PEAK PERFORMANCE: <span className="text-gray-300">{topActivity.activities.name}</span>
          <span className={`ml-2 ${cfg.color}`}>{topActivity.meta_score.toFixed(0)}</span>
        </div>
      )}
    </div>
  );
}
