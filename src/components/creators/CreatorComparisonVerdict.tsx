import { CreatorComparisonSnapshot } from "@/types/intelligence";
import { VERDICT_RULES } from "@/lib/intelligence/comparisonRules";
import { CheckCircle2, Target, Zap, Activity, ShieldCheck, Trophy } from "lucide-react";

export function CreatorComparisonVerdict({
  challenger,
  defender,
}: {
  challenger: CreatorComparisonSnapshot;
  defender: CreatorComparisonSnapshot;
}) {
  const bestDiscoverer = VERDICT_RULES.getBestDiscoverer(challenger, defender);
  const bestValidator = VERDICT_RULES.getBestValidator(challenger, defender);
  const bestForecaster = VERDICT_RULES.getBestForecaster(challenger, defender);
  const mostInfluential = VERDICT_RULES.getMostInfluential(challenger, defender);
  const highestConfidence = VERDICT_RULES.getHighestConfidence(challenger, defender);
  const bestOverall = VERDICT_RULES.getBestOverall(challenger, defender);

  const verdicts = [
    {
      title: "Best Discoverer",
      result: bestDiscoverer,
      icon: <Activity className="w-4 h-4 text-primary" />,
      bestFor: "Finding emerging metas before the community catches on.",
      color: "border-primary/30 bg-primary/5",
      textColor: "text-primary",
    },
    {
      title: "Best Validator",
      result: bestValidator,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      bestFor: "Confirming meta stability and avoiding bait builds.",
      color: "border-emerald-500/30 bg-emerald-500/5",
      textColor: "text-emerald-400",
    },
    {
      title: "Best Forecaster",
      result: bestForecaster,
      icon: <Target className="w-4 h-4 text-cyan-400" />,
      bestFor: "Investing resources in builds that will survive patches.",
      color: "border-cyan-500/30 bg-cyan-500/5",
      textColor: "text-cyan-400",
    },
    {
      title: "Most Influential",
      result: mostInfluential,
      icon: <Zap className="w-4 h-4 text-purple-400" />,
      bestFor: "Following the absolute center of gravity in the creator space.",
      color: "border-purple-500/30 bg-purple-500/5",
      textColor: "text-purple-400",
    },
    {
      title: "Highest Confidence",
      result: highestConfidence,
      icon: <ShieldCheck className="w-4 h-4 text-orange-400" />,
      bestFor: "Risk-averse players seeking statistically proven advice.",
      color: "border-orange-500/30 bg-orange-500/5",
      textColor: "text-orange-400",
    },
    {
      title: "Best Overall Analyst",
      result: bestOverall,
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      bestFor: "The primary source of truth for Division 2 intelligence.",
      color: "border-yellow-400 bg-yellow-400/10 md:col-span-2 lg:col-span-1 xl:col-span-2",
      textColor: "text-yellow-400",
      large: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-mono text-white tracking-widest uppercase mb-1">Intelligence Verdict</h3>
        <p className="text-xs text-gray-500 font-mono">Automated conclusion engine based on comparative telemetry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {verdicts.map((v, i) => (
          <div key={i} className={`border p-5 flex flex-col justify-between ${v.color}`}>
            <div>
              <div className="flex items-center gap-2 mb-4">
                {v.icon}
                <div className={`text-[10px] font-mono tracking-widest uppercase ${v.textColor}`}>
                  {v.title}
                </div>
              </div>
              <div className={`font-black font-mono text-white tracking-tight uppercase mb-1 ${v.large ? "text-3xl" : "text-xl"}`}>
                {v.result.winner.name}
              </div>
              <div className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mb-4">
                Score: <span className="text-white">{v.result.score}</span>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              <div>
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Why</div>
                <ul className="text-xs text-gray-300 space-y-1">
                  {v.result.reasons.map((r, ri) => (
                    <li key={ri} className="flex items-start gap-2">
                      <span className="text-gray-600 mt-0.5">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mb-1">Best For</div>
                <div className="text-xs text-gray-300 font-semibold">{v.bestFor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
