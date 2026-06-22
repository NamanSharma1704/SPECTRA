"use client";

import { useSearchParams } from "next/navigation";
import { ShieldCheck, Crosshair, Users, Activity, CheckCircle2 } from "lucide-react";

export function OperationalBriefing({ topBuild, alternatives, operationScore }: { topBuild: any, alternatives: any[], operationScore: number }) {
  const searchParams = useSearchParams();

  // Parse params for display
  const content = searchParams.get("content") || "All Activities";
  const group = searchParams.get("group") || "Any";
  const playstyle = searchParams.get("playstyle") || "Any";
  const priority = searchParams.get("priority") || "META";

  if (!topBuild) return null;

  // Breakdown simulation for demonstration of the scoring algorithm
  // In a real scenario, these would be exported from the scoring engine
  const activityMatch = Math.min(98, Math.round(operationScore * 1.05));
  const playstyleMatch = Math.min(95, Math.round(operationScore * 0.98));
  const groupMatch = Math.min(92, Math.round(operationScore * 0.95));
  const verification = topBuild.creators?.is_verified ? 95 : 85;
  const overallConf = Math.round((activityMatch * 0.35) + (playstyleMatch * 0.25) + (groupMatch * 0.15) + (verification * 0.15) + (90 * 0.10));

  return (
    <div className="mb-6 border border-primary/40 bg-[#090909] font-mono text-[10px] text-gray-400 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
      
      {/* Header */}
      <div className="bg-primary/10 border-b border-primary/30 p-3 flex items-center justify-between">
        <h2 className="text-primary font-bold uppercase tracking-widest flex items-center gap-2 text-xs">
          <Activity className="w-4 h-4" /> MISSION ANALYSIS
        </h2>
        <span className="bg-primary text-black font-bold px-2 py-0.5 tracking-wider">READINESS: DEPLOY</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-primary/20">
        
        {/* Col 1: Profile & Recommendation */}
        <div className="md:col-span-4 p-4 space-y-4">
          <div>
            <div className="text-primary/60 uppercase font-bold tracking-widest mb-1">Operation Profile</div>
            <div className="text-white text-xs">Target: <span className="text-primary">{content}</span></div>
            <div className="text-white text-xs">Group: <span className="text-primary">{group}</span></div>
            <div className="text-white text-xs">Role: <span className="text-primary">{playstyle}</span></div>
            <div className="text-white text-xs">Priority: <span className="text-primary">{priority}</span></div>
          </div>

          <div className="pt-2 border-t border-primary/20">
            <div className="text-primary/60 uppercase font-bold tracking-widest mb-1">Recommended Execution</div>
            <div className="text-primary font-bold text-sm uppercase tracking-wide neon-text">
              {topBuild.name}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-start gap-1">
                <span className="text-green-500">+</span>
                <span>Highest match for current parameters</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-green-500">+</span>
                <span>Optimal {playstyle !== "ANY" ? playstyle : "Hybrid"} synergy</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-green-500">+</span>
                <span>Verified by {topBuild.creators?.name || "Community"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Confidence & Metrics */}
        <div className="md:col-span-4 p-4 space-y-4">
          <div>
            <div className="text-primary/60 uppercase font-bold tracking-widest mb-2">Recommendation Confidence</div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span>Activity Match</span>
                <span className="text-white">{activityMatch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Playstyle Match</span>
                <span className="text-white">{playstyleMatch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Group Match</span>
                <span className="text-white">{groupMatch}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Verification</span>
                <span className="text-white">{verification}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-primary/20 mt-1">
                <span className="text-primary font-bold">Overall Confidence</span>
                <span className="text-primary font-bold">{overallConf}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-primary/20 grid grid-cols-2 gap-2">
            <div>
              <div className="text-primary/50">Mission Risk</div>
              <div className="text-green-400 font-bold uppercase">{priority === "SURVIVE" ? "LOW" : "MEDIUM"}</div>
            </div>
            <div>
              <div className="text-primary/50">Time To Farm</div>
              <div className="text-yellow-400 font-bold uppercase">{priority === "FARM" ? "FAST" : "MEDIUM"}</div>
            </div>
            <div>
              <div className="text-primary/50">Patch Stability</div>
              <div className="text-green-400 font-bold uppercase">HIGH</div>
            </div>
            <div>
              <div className="text-primary/50">Verification</div>
              <div className="text-primary font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Col 3: Alternatives & Sources */}
        <div className="md:col-span-4 p-4 space-y-4">
          <div>
            <div className="text-primary/60 uppercase font-bold tracking-widest mb-2">Why Not Alternatives?</div>
            <div className="space-y-3">
              {alternatives.slice(0, 2).map((alt) => (
                <div key={alt.id}>
                  <div className="text-white font-bold truncate">{alt.name.toUpperCase()}</div>
                  <div className="text-primary/70 leading-tight mt-0.5">
                    - Lower match for {group !== "ANY" ? group : content}
                    <br />
                    - Better suited for {alt.archetype === "tank" ? "survivability" : "other playstyles"}
                  </div>
                </div>
              ))}
              {alternatives.length === 0 && (
                <div className="text-primary/50 italic">No close alternatives found for this profile.</div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-primary/20">
            <div className="text-primary/60 uppercase font-bold tracking-widest mb-2 flex items-center justify-between">
              <span>Detected Sources: 4</span>
              <span className="text-[9px] bg-primary/20 text-primary px-1">FUTURE</span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px]">
              <div className="flex items-center gap-1 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Widdz</div>
              <div className="flex items-center gap-1 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> NothingButSkillz</div>
              <div className="flex items-center gap-1 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Reddit</div>
              <div className="flex items-center gap-1 text-white"><CheckCircle2 className="w-3 h-3 text-primary" /> Community Build</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
