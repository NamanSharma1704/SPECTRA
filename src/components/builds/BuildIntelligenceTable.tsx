"use client";
import { useState, useEffect } from "react";
import { DIPClient } from "@/client/sdk";
import { Activity, ShieldAlert, Crosshair, GitCompare, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OperationalBriefing } from "./OperationalBriefing";

export function BuildIntelligenceTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [builds, setBuilds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareQueue, setCompareQueue] = useState<string[]>([]); // max 2 IDs

  useEffect(() => {
    async function loadData() {
      try {
        const res = await DIPClient.getBuilds();
        setBuilds(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  function toggleCompare(id: string) {
    setCompareQueue((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // slide window
      return [...prev, id];
    });
  }

  function launchCompare() {
    if (compareQueue.length === 2) {
      router.push(`/compare?a=${compareQueue[0]}&b=${compareQueue[1]}`);
    }
  }

  // Deterministic Scoring Engine
  const mappedBuilds = builds.map(b => {
    const content = searchParams.get("content") || "ALL";
    const group = searchParams.get("group") || "ANY";
    const playstyle = searchParams.get("playstyle") || "ANY";
    const priority = searchParams.get("priority") || "META";
    
    const arch = b.archetype?.toLowerCase() || "unknown";
    const maxDbScore = b.build_activity_scores?.length > 0 
        ? Math.max(...b.build_activity_scores.map((s: any) => s.meta_score)) : 80;

    // 1. Activity Match (35%)
    let activityMatch = 50;
    if (content === "ALL") {
      activityMatch = maxDbScore;
    } else {
      const hasMatch = b.build_activity_scores?.some((s: any) => 
        s.activities?.name?.toUpperCase().includes(content.toUpperCase()) ||
        content.toUpperCase().includes(s.activities?.name?.toUpperCase())
      );
      activityMatch = hasMatch ? 100 : 40;
    }

    // 2. Playstyle Match (25%)
    let playstyleMatch = 50;
    if (playstyle === "ANY") {
      playstyleMatch = 90;
    } else if (arch.includes(playstyle.toLowerCase())) {
      playstyleMatch = 100;
    } else if (arch === "hybrid") {
      playstyleMatch = 75;
    } else {
      playstyleMatch = 30;
    }

    // 3. Group Match (15%)
    let groupMatch = 80;
    if (group === "SOLO") {
      if (arch === "support") groupMatch = 20;
      else if (arch === "tank") groupMatch = 60;
      else groupMatch = 95;
    } else if (group === "SQUAD" || group === "TRIO") {
      if (arch === "support") groupMatch = 100;
      else if (arch === "tank") groupMatch = 90;
      else groupMatch = 85;
    }

    // 4. Verification Score (15%)
    const verificationScore = b.creators?.is_verified ? 100 : 75;

    // 5. Priority Match (10%)
    let priorityMatch = 80;
    if (priority === "META") priorityMatch = maxDbScore;
    if (priority === "SURVIVE") priorityMatch = (arch === "tank" || arch === "hybrid") ? 100 : 50;
    if (priority === "SPEED") priorityMatch = (arch === "dps" || arch === "skill") ? 95 : 40;

    const operationScore = Math.round(
      (activityMatch * 0.35) + 
      (playstyleMatch * 0.25) + 
      (groupMatch * 0.15) + 
      (verificationScore * 0.15) + 
      (priorityMatch * 0.10)
    );

    // Re-calculate topThreat based on operationScore for the UI
    let topThreat = "GAMMA";
    if (operationScore >= 90) topThreat = "OMEGA";
    else if (operationScore >= 75) topThreat = "ALPHA";

    return { ...b, operationScore, topThreat };
  }).sort((a, b) => b.operationScore - a.operationScore);

  const topBuild = mappedBuilds.length > 0 ? mappedBuilds[0] : null;
  const alternatives = mappedBuilds.slice(1, 3);

  if (loading) return <div className="text-primary font-mono p-4 animate-pulse">DECRYPTING DATA...</div>;

  return (
    <div className="w-full font-mono text-xs text-primary/80">
      
      {/* Operational Briefing injected here */}
      <OperationalBriefing 
        topBuild={topBuild} 
        alternatives={alternatives} 
        operationScore={topBuild?.operationScore || 0} 
      />

      {/* Compare queue banner */}
      {compareQueue.length > 0 && (
        <div className="mb-3 flex items-center gap-3 border border-primary/30 bg-primary/5 px-4 py-2">
          <GitCompare className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-primary/80 text-[11px] flex-1">
            {compareQueue.length === 1
              ? `QUEUED: ${builds.find((b) => b.id === compareQueue[0])?.name ?? "…"} — select one more`
              : `READY: ${builds.find((b) => b.id === compareQueue[0])?.name} vs ${builds.find((b) => b.id === compareQueue[1])?.name}`}
          </span>
          {compareQueue.length === 2 && (
            <button
              onClick={launchCompare}
              className="px-3 py-1 bg-primary text-black font-bold text-[11px] hover:bg-white transition-colors"
            >
              COMPARE →
            </button>
          )}
          <button onClick={() => setCompareQueue([])} className="text-gray-600 hover:text-white">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="overflow-x-auto w-full p-4 relative z-10">
          <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="border-b border-white/10 text-white/50 uppercase tracking-[0.2em] text-opacity-60 pb-2">
              <th className="py-3 px-2 font-normal w-12">Rank</th>
              <th className="py-3 px-2 font-normal w-24">Build ID</th>
              <th className="py-3 px-2 font-normal">Designation</th>
              <th className="py-3 px-2 font-normal w-28">Archetype</th>
              <th className="py-3 px-2 font-normal w-40">Creator</th>
              <th className="py-3 px-2 font-normal w-32">Threat Level</th>
              <th className="py-3 px-2 font-normal w-40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {mappedBuilds.map((build, idx) => {
              const maxScore = build.operationScore;
              const topThreat = build.topThreat;
              const inQueue = compareQueue.includes(build.id);

              return (
                <tr key={build.id} className={`transition-all duration-300 group ${inQueue ? "bg-primary/20 border-l-2 border-l-primary shadow-[inset_4px_0_0_0_#ff6a00]" : "hover:bg-white/5"}`}>
                  <td className="py-4 px-2 text-white/80">#{idx + 1}</td>
                  <td className="py-4 px-2 opacity-40 font-mono text-[10px]">{build.id.split('-')[0].toUpperCase()}</td>
                  <td className="py-4 px-2 font-bold text-white tracking-widest truncate group-hover:text-primary group-hover:drop-shadow-[0_0_8px_rgba(255,106,0,0.8)] transition-all" title={build.name.toUpperCase()}>{build.name.toUpperCase()}</td>
                  <td className="py-4 px-2 text-white/50">[{build.archetype?.toUpperCase() || 'UNKNOWN'}]</td>
                  <td className="py-4 px-2">
                    {build.creators?.id ? (
                      <Link href={`/creators/${build.creators.id}`} className="text-white/80 hover:text-primary transition-colors hover:underline decoration-primary/50 underline-offset-4">
                        {build.creators.name?.toUpperCase()}
                      </Link>
                    ) : (
                      <span className="text-white/60">{build.creators?.name?.toUpperCase() || (build.build_sources && build.build_sources.length > 0 ? build.build_sources[0].creator_name?.toUpperCase() : null) || 'SHD_AGENT'}</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold flex items-center gap-1.5 ${topThreat === 'OMEGA' ? 'text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]' : topThreat === 'ALPHA' ? 'text-orange-400 drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]' : 'text-gray-400'}`}>
                        {topThreat === 'OMEGA' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                        {topThreat}
                      </span>
                      <span className="text-[10px] text-white/40 font-mono bg-white/5 px-1.5 py-0.5 rounded">{maxScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Compare toggle */}
                      <button
                        onClick={() => toggleCompare(build.id)}
                        title={inQueue ? "Remove from compare" : "Add to compare"}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] transition-all
                          ${inQueue
                            ? "bg-primary text-black shadow-[0_0_10px_rgba(255,106,0,0.5)]"
                            : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"}`}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                      </button>
                      {/* Inspect */}
                      <Link
                        href={`/builds/${build.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-black hover:shadow-[0_0_15px_rgba(255,106,0,0.6)] transition-all font-bold tracking-widest"
                      >
                        <Crosshair className="w-3.5 h-3.5" /> INSPECT
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {/* Filler rows if sparse */}
            {builds.length < 5 && Array.from({length: 5 - builds.length}).map((_, idx) => (
              <tr key={`fake-${idx}`} className="opacity-20 pointer-events-none">
                <td className="py-4 px-2 text-white">#{(builds.length + idx + 1)}</td>
                <td className="py-4 px-2 font-mono text-[10px]">ENCRYPTED</td>
                <td className="py-4 px-2 font-bold tracking-widest text-white/50">DATA_CORRUPTED</td>
                <td className="py-4 px-2 text-white/50">[UNKNOWN]</td>
                <td className="py-4 px-2 text-white/50">REDACTED</td>
                <td className="py-4 px-2 text-white/30">GAMMA</td>
                <td className="py-4 px-2 text-right">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/5 text-white/30 text-[10px] tracking-widest">
                    LOCKED
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
