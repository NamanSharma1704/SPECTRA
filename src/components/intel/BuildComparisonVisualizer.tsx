"use client";

import { Target, Check, AlertCircle } from "lucide-react";

interface VisualizerProps {
  data: {
    scope: string;
    buildA: any;
    buildB: any;
  }
}

export function BuildComparisonVisualizer({ data }: VisualizerProps) {
  const { scope, buildA, buildB } = data;

  const getWinner = (valA: number, valB: number) => {
    if (valA > valB) return { winner: 'A', delta: valA - valB };
    if (valB > valA) return { winner: 'B', delta: valB - valA };
    return { winner: 'TIE', delta: 0 };
  };

  const metrics = [
    { label: "Meta Score", key: "metaScore", suffix: "" },
    { label: "Confidence", key: "confidence", suffix: "" },
    { label: "Stability", key: "stability", suffix: "" },
    { label: "Consensus", key: "consensus", suffix: "" },
    { label: "Community Approval", key: "communityApproval", suffix: "%" },
    { label: "Creator Support", key: "creators", isArray: true, suffix: " Creators" },
  ];

  // Logic to determine overall winner
  let scoreA = 0;
  let scoreB = 0;

  metrics.forEach(m => {
    const valA = m.isArray ? buildA[m.key].length : buildA[m.key];
    const valB = m.isArray ? buildB[m.key].length : buildB[m.key];
    
    // Default weights
    let weight = 1;

    // Scope-weighted reasoning
    if (scope === "Raid" || scope === "Incursion") {
      if (buildA.bestFor?.includes("Group Support") || buildA.bestFor?.includes("Healing")) scoreA += 50;
      if (buildB.bestFor?.includes("Group Support") || buildB.bestFor?.includes("Healing")) scoreB += 50;
    }

    if (valA > valB) scoreA += weight * (valA - valB);
    else if (valB > valA) scoreB += weight * (valB - valA);
  });

  const overallWinner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'TIE';
  const winnerBuild = overallWinner === 'A' ? buildA : buildB;
  const loserBuild = overallWinner === 'A' ? buildB : buildA;

  // Calculate Decision Confidence Gap
  const confA = buildA.confidence;
  const confB = buildB.confidence;
  const confGap = Math.abs(confA - confB);
  const decisionConfidence = Math.min(99, 50 + confGap + Math.abs(scoreA - scoreB) / 2);

  const getRowClass = (winner: string, isA: boolean) => {
    if (winner === 'TIE') return "text-gray-500";
    if (isA && winner === 'A') return "text-purple-400 font-bold bg-purple-900/10";
    if (!isA && winner === 'B') return "text-cyan-400 font-bold bg-cyan-900/10";
    return "text-gray-600";
  };

  return (
    <div className="space-y-12">
      
      {/* Best For Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="border border-purple-900/30 p-6">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Best For</div>
          <div className="flex flex-wrap gap-2">
            {buildA.bestFor?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-purple-900/20 text-purple-400 border border-purple-500/30 text-xs font-mono uppercase tracking-wider">
                ✓ {tag}
              </span>
            ))}
            {(!buildA.bestFor || buildA.bestFor.length === 0) && <span className="text-gray-600 text-xs font-mono">No specific tags</span>}
          </div>
        </div>

        <div className="border border-cyan-900/30 p-6">
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-4">Best For</div>
          <div className="flex flex-wrap gap-2">
            {buildB.bestFor?.map((tag: string) => (
              <span key={tag} className="px-3 py-1 bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono uppercase tracking-wider">
                ✓ {tag}
              </span>
            ))}
            {(!buildB.bestFor || buildB.bestFor.length === 0) && <span className="text-gray-600 text-xs font-mono">No specific tags</span>}
          </div>
        </div>
      </div>

      {/* The Delta Table */}
      <div className="border border-gray-800 bg-gray-950 p-6">
        <h3 className="text-sm font-bold font-mono text-white tracking-widest uppercase mb-6 flex items-center gap-2">
          <Target className="w-4 h-4" /> Head-to-Head Telemetry
        </h3>
        
        <div className="space-y-2">
          {metrics.map(m => {
            const valA = m.isArray ? buildA[m.key].length : buildA[m.key];
            const valB = m.isArray ? buildB[m.key].length : buildB[m.key];
            const { winner, delta } = getWinner(valA, valB);
            
            return (
              <div key={m.key} className="grid grid-cols-3 items-center border-b border-gray-800/50 py-3 last:border-0">
                
                {/* Build A column */}
                <div className={`text-sm font-mono tracking-wider ${getRowClass(winner, true)}`}>
                  {valA}{m.suffix}
                </div>

                {/* Center Label */}
                <div className="text-center">
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                    {m.label}
                  </div>
                  {winner !== 'TIE' ? (
                    <div className={`text-xs font-mono font-bold tracking-widest ${winner === 'A' ? 'text-purple-400' : 'text-cyan-400'}`}>
                      WINNER: {winner === 'A' ? buildA.gearset.slug.toUpperCase() : buildB.gearset.slug.toUpperCase()} (+{delta}{m.suffix})
                    </div>
                  ) : (
                    <div className="text-xs font-mono font-bold tracking-widest text-gray-500">TIE</div>
                  )}
                </div>

                {/* Build B column */}
                <div className={`text-right text-sm font-mono tracking-wider ${getRowClass(winner, false)}`}>
                  {valB}{m.suffix}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation Outcome */}
      <div className={`border p-8 ${overallWinner === 'A' ? 'bg-purple-950/10 border-purple-500/50' : overallWinner === 'B' ? 'bg-cyan-950/10 border-cyan-500/50' : 'bg-gray-900 border-gray-700'}`}>
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          
          <div className="flex-1">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Overall Winner ({scope} Context)
            </div>
            <h2 className={`text-4xl font-black font-mono tracking-tight uppercase mb-6 ${overallWinner === 'A' ? 'text-purple-400' : overallWinner === 'B' ? 'text-cyan-400' : 'text-white'}`}>
              {overallWinner !== 'TIE' ? `${winnerBuild.gearset.displayName} ${winnerBuild.weapon.displayName}` : 'Absolute Tie'}
            </h2>
            
            {overallWinner !== 'TIE' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold font-mono text-white tracking-widest uppercase mb-2">Why It Wins Here:</h4>
                  <div className="space-y-1">
                    {winnerBuild.bestFor?.map((tag: string) => (
                      <div key={tag} className="text-sm font-mono text-gray-300">✓ Dominates {tag}</div>
                    ))}
                    <div className="text-sm font-mono text-gray-300">✓ Statistically stronger in chosen scope</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-8">
            <div className="mb-8">
              <div className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">Decision Confidence</div>
              <div className="text-3xl font-black font-mono text-white">
                {decisionConfidence.toFixed(0)}%
              </div>
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
                {decisionConfidence > 80 ? "Clear Winner" : "Very Close Matchup"} (Gap: +{confGap})
              </div>
            </div>

            {overallWinner !== 'TIE' && (
              <div>
                <h4 className="text-xs font-bold font-mono text-gray-400 tracking-widest uppercase mb-2">
                  {loserBuild.gearset.displayName} Still Wins At:
                </h4>
                <div className="space-y-1">
                  {loserBuild.bestFor?.map((tag: string) => (
                    <div key={tag} className="text-sm font-mono text-gray-500">✓ {tag} Utility</div>
                  ))}
                  {(!loserBuild.bestFor || loserBuild.bestFor.length === 0) && (
                    <div className="text-sm font-mono text-gray-500">Niche use-cases only.</div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
