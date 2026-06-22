"use client";

interface ScoredActivity {
  meta_score: number;
  confidence_score: number;
  threat_level: string;
  tier: string;
  activities: { name: string; type: string } | null;
}

interface VerdictPanelProps {
  verdict: "DEPLOY" | "SITUATIONAL" | "AVOID";
  avgMetaScore: number;
  scoredActivities: ScoredActivity[];
}

const VERDICT_CONFIG = {
  DEPLOY: {
    label: "DEPLOY",
    sub: "This build is operationally effective. Cleared for field deployment.",
    bg: "from-cyan-950/60 to-transparent",
    border: "border-cyan-500/40",
    bar: "bg-cyan-400",
    text: "text-cyan-400",
  },
  SITUATIONAL: {
    label: "SITUATIONAL",
    sub: "Effective in specific contexts. Review activity matrix before deploying.",
    bg: "from-orange-950/60 to-transparent",
    border: "border-orange-500/40",
    bar: "bg-orange-400",
    text: "text-orange-400",
  },
  AVOID: {
    label: "AVOID",
    sub: "Below operational threshold. Not recommended for current meta.",
    bg: "from-red-950/40 to-transparent",
    border: "border-red-700/40",
    bar: "bg-red-600",
    text: "text-red-400",
  },
};

function getTierForActivity(type: string, scores: ScoredActivity[]) {
  const match = scores.find((s) => s.activities?.type === type);
  return match ?? scores[0];
}

export function VerdictPanel({ verdict, avgMetaScore, scoredActivities }: VerdictPanelProps) {
  const cfg = VERDICT_CONFIG[verdict];
  const barWidth = Math.min(100, avgMetaScore);

  const soloActivity = getTierForActivity("MISSION", scoredActivities) ?? scoredActivities[0];
  const groupActivity = getTierForActivity("ENDGAME", scoredActivities) ?? scoredActivities[1];
  const pvpActivity = getTierForActivity("PVP", scoredActivities) ?? scoredActivities[scoredActivities.length - 1];

  const quickDecisions = [
    {
      label: "SOLO",
      score: soloActivity?.meta_score ?? 0,
      activity: soloActivity?.activities?.name ?? "—",
      tier: soloActivity?.tier ?? "D",
    },
    {
      label: "GROUP",
      score: groupActivity?.meta_score ?? 0,
      activity: groupActivity?.activities?.name ?? "—",
      tier: groupActivity?.tier ?? "D",
    },
    {
      label: "PVP",
      score: pvpActivity?.meta_score ?? 0,
      activity: pvpActivity?.activities?.name ?? "—",
      tier: pvpActivity?.tier ?? "D",
    },
  ];

  return (

    <div className="grid grid-cols-1 md:grid-cols-12 gap-1 mt-1 mb-8 border-y border-gray-800">
      
      {/* 4D Intelligence Core */}
      <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-800 bg-black/40">
        
        {/* Meta Score */}
        <div className="p-6 flex flex-col justify-center items-center relative group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Meta Score</div>
          <div className={`text-5xl font-black font-mono ${
            avgMetaScore >= 90 ? "text-primary" :
            avgMetaScore >= 75 ? "text-orange-400" : "text-yellow-500"
          }`}>
            {avgMetaScore}
          </div>
          <div className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-widest text-center">Strength</div>
        </div>

        {/* Stability Score */}
        <div className="p-6 flex flex-col justify-center items-center relative group">
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Stability Score</div>
          <div className="text-5xl font-black font-mono text-blue-400">94</div>
          <div className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-widest text-center">Patch Resilience</div>
        </div>

        {/* Consensus Score */}
        <div className="p-6 flex flex-col justify-center items-center relative group">
          <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Consensus</div>
          <div className="text-5xl font-black font-mono text-purple-400">92</div>
          <div className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-widest text-center">Community Agreement</div>
        </div>

        {/* Intelligence Confidence */}
        <div className="p-6 flex flex-col justify-center items-center relative group">
          <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-2">Confidence</div>
          <div className="text-5xl font-black font-mono text-green-400">91</div>
          <div className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-widest text-center">Evidence Quality</div>
        </div>

      </div>

      {/* Intelligence Ledger Details */}
      <div className="md:col-span-4 bg-gray-900/40 p-5 flex flex-col justify-center font-mono">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Source Count</span>
            <span className="text-white font-bold">7</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Origin Creator</span>
            <span className="text-white font-bold">Widdz</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Validation Creators</span>
            <span className="text-white font-bold">2</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Community Confirmations</span>
            <span className="text-white font-bold">4</span>
          </div>
          <div className="h-px bg-gray-800 w-full my-2"></div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Patch Status</span>
            <span className="text-green-400 font-bold">CURRENT</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Build Status</span>
            <span className="text-primary font-bold">ACTIVE</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 uppercase tracking-widest">Last Verified</span>
            <span className="text-gray-300 font-bold">2 Days Ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
