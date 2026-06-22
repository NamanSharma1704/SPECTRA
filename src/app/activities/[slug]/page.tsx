import React from "react";
import { DIPClient } from "@/client/sdk";
import { ShieldAlert, Target, TrendingUp, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const readableName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const activitiesRes = await DIPClient.getActivities();
  const activity = activitiesRes.data.find((a: any) => a.name.toLowerCase() === readableName.toLowerCase());

  if (!activity) {
    return (
      <div className="font-mono">
        <div className="border border-red-800/40 bg-red-950/10 p-8 text-center">
          <div className="text-red-500 font-bold text-lg mb-2">ACTIVITY NOT FOUND</div>
          <div className="text-gray-600 text-sm mb-4">&ldquo;{readableName}&rdquo; is not in the SHD network.</div>
          <Link href="/builds" className="text-primary hover:underline text-sm flex items-center gap-1 justify-center">
            <ChevronLeft className="w-3 h-3" /> Return to Build Explorer
          </Link>
        </div>
      </div>
    );
  }

  const buildsRes = await DIPClient.getActivityBuilds(activity.id);
  const builds: any[] = buildsRes.data || [];

  return (
    <div className="text-gray-200 font-mono space-y-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600">
        <Link href="/builds" className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-3 h-3" /> BUILD_INTELLIGENCE
        </Link>
        <span>/</span>
        <span className="text-gray-400 uppercase">{activity.name}</span>
      </nav>

      {/* Header */}
      <div className="border-b border-gray-800 pb-5">
        <div className="text-[10px] text-gray-600 tracking-widest mb-2 uppercase">
          SHD_OS // ACTIVITY_INTELLIGENCE // FIELD_OPS
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-wide uppercase leading-tight">
          {activity.name}
        </h1>
        <div className="text-gray-500 font-mono text-xs sm:text-sm mt-2 flex flex-wrap gap-3">
          <span>CLASSIFICATION: {activity.type}</span>
          <span>·</span>
          <span>DIFFICULTY: {activity.difficulty}</span>
          <span>·</span>
          <span className="text-primary">{builds.length} BUILDS INDEXED</span>
        </div>
        <div className="mt-4 h-px bg-gradient-to-r from-cyan-500/60 via-cyan-500/20 to-transparent" />
      </div>

      {/* Intel cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-gray-800 bg-black/40 p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500" />
          <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-3 flex items-center gap-1.5 tracking-widest">
            <Target className="w-3 h-3" /> Primary Objective
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            The meta for {activity.name} favors{" "}
            <span className="text-cyan-400 font-bold">{builds[0]?.builds?.archetype ?? "DPS"}</span> archetypes.
            Equip high burst damage with sustained survivability.
          </p>
        </div>

        <div className="border border-gray-800 bg-black/40 p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-orange-500" />
          <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-3 flex items-center gap-1.5 tracking-widest">
            <TrendingUp className="w-3 h-3" /> Trending Archetypes
          </h3>
          <div className="space-y-2">
            {[["DPS","64%","text-orange-400"],["SKILL","22%","text-cyan-400"],["TANK","14%","text-gray-300"]].map(([label,pct,color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className={`text-sm font-bold font-mono ${color}`}>{label}</span>
                <span className="text-xs font-mono text-gray-500">{pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-gray-800 bg-black/40 p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500" />
          <h3 className="text-gray-400 font-mono text-[10px] uppercase mb-3 flex items-center gap-1.5 tracking-widest">
            <ShieldAlert className="w-3 h-3" /> Threat Assessment
          </h3>
          <div className="text-2xl font-bold text-red-500 font-mono">CRITICAL</div>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Min Meta Score of 85 required for reliable extraction.
          </p>
        </div>
      </div>

      {/* Build leaderboard */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold font-mono text-white tracking-widest uppercase border-b border-gray-800 pb-3 mb-4">
          Tier-1 Loadouts — {activity.name}
        </h2>

        {builds.length === 0 ? (
          <div className="border border-gray-800 p-10 text-center text-gray-700 font-mono">
            NO BUILDS INDEXED FOR THIS ACTIVITY
          </div>
        ) : (
          <div className="space-y-2">
            {builds.map((b: any, i: number) => (
              <Link href={`/builds/${b.builds.id}`} key={b.builds.id} className="block group">
                <div className="border border-gray-800 bg-black/30 p-4 flex items-center justify-between gap-4 hover:border-cyan-500/40 hover:bg-cyan-950/10 transition-all">
                  {/* Rank + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-800 font-mono w-10 flex-shrink-0 group-hover:text-cyan-500/50 transition-colors">
                      #{i + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors truncate text-sm sm:text-base">
                        {b.builds.name}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-0.5 text-[10px] font-mono text-gray-500">
                        <span>{b.builds.archetype}</span>
                        <span>·</span>
                        <span>{b.builds.creators?.name ?? "UNKNOWN"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0 text-right">
                    <div>
                      <div className="text-[9px] text-gray-600 font-mono">META</div>
                      <div className={`text-base sm:text-xl font-black font-mono ${b.meta_score >= 90 ? "text-cyan-400" : "text-gray-300"}`}>
                        {b.meta_score.toFixed(0)}
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-[9px] text-gray-600 font-mono">THREAT</div>
                      <div className={`text-sm font-bold font-mono ${b.threat_level === "OMEGA" ? "text-red-500" : b.threat_level === "ALPHA" ? "text-orange-400" : "text-gray-500"}`}>
                        {b.threat_level}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-gray-800 flex justify-between items-center text-xs font-mono text-gray-700">
        <Link href="/builds" className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-3 h-3" /> Build Explorer
        </Link>
        <span className="hidden sm:block">SHD_OS // ACTIVITY_INTEL v1.0</span>
      </div>
    </div>
  );
}
