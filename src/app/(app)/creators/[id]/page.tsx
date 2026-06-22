import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { CreatorRepository } from "@/server/repositories/CreatorRepository";
import { CreatorProfileHeader } from "@/components/creators/CreatorProfileHeader";
import { CreatorSpecializationChart } from "@/components/creators/CreatorSpecializationChart";
import { CreatorArchetypesInfluenced } from "@/components/creators/CreatorArchetypesInfluenced";
import { CreatorIntelligenceContributions } from "@/components/creators/CreatorIntelligenceContributions";
import { CreatorActivityHeatmap } from "@/components/creators/CreatorActivityHeatmap";
import { CreatorActivityTimeline } from "@/components/creators/CreatorActivityTimeline";
import { ForecastingStatisticsPanel } from "@/components/creators/ForecastingStatisticsPanel";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let profile: any;
  try {
    profile = await CreatorRepository.getCreatorById(id);
  } catch {
    notFound();
  }

  const { creator, builds, intelligenceContributions, archetypeBreakdown, activityPerformance, stats } = profile;

  // Fetch Trust Scores
  const { data: trustData } = await (db as any)
    .from("creator_trust_scores")
    .select("*")
    .eq("creator_id", id)
    .single();

  const forecastingStats = trustData ? {
    trustTier: trustData.trust_tier,
    hybridAccuracyState: { status: "AVAILABLE" as const, accuracy: Math.round(trustData.hybrid_accuracy) },
    successfulCalls: trustData.successful_calls_lifetime,
    emergingCalls: trustData.emerging_calls_lifetime,
    avgLeadTimeState: trustData.average_lead_time_days > 0 
      ? { status: "AVAILABLE" as const, leadTime: Math.round(trustData.average_lead_time_days) }
      : { status: "NO_DATA" as const }
  } : {
    trustTier: "UNRATED",
    hybridAccuracyState: { status: "NO_DATA" as const },
    successfulCalls: 0,
    emergingCalls: 0,
    avgLeadTimeState: { status: "NO_DATA" as const }
  };

  // Compute meta influence: how many of their builds are #1 in any activity
  const topBuilds = builds.filter((b: any) => b.peakScore >= 90).length;

  return (
    <div className="min-h-screen text-gray-200 font-mono">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-3 mb-6 text-xs font-mono text-gray-600">
          <Link href="/creators" className="hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> CREATOR NETWORK
          </Link>
          <span>/</span>
          <span className="text-gray-400">{creator.name.toUpperCase()}</span>
        </nav>

        {/* Profile Header */}
        <CreatorProfileHeader creator={creator} stats={stats} />

        {/* Intelligence Grid: 2-col */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — 8 cols */}
          <div className="lg:col-span-8 space-y-6">
            <CreatorIntelligenceContributions contributions={intelligenceContributions} />
            <CreatorArchetypesInfluenced archetypes={builds} creatorName={creator.name} />
            <CreatorActivityHeatmap activities={activityPerformance} />
            <CreatorActivityTimeline builds={builds} videos={profile.videos} />
          </div>

          {/* RIGHT — 4 cols */}
          <div className="lg:col-span-4 space-y-5">
            <CreatorSpecializationChart archetypes={archetypeBreakdown} />

            <ForecastingStatisticsPanel stats={forecastingStats} />

            {/* Influence Score Panel */}
            <div className="border border-gray-800 bg-black/40 p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-orange-500 inline-block" />
                <h2 className="text-xs font-mono font-bold text-gray-400 tracking-widest uppercase">
                  Meta Influence
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "TOTAL BUILDS", value: stats.buildCount, color: "text-white" },
                  { label: "OMEGA-TIER BUILDS", value: stats.omegaBuilds, color: "text-red-500" },
                  { label: "PEAK-SCORE BUILDS (≥90)", value: topBuilds, color: "text-cyan-400" },
                  { label: "AVG META SCORE", value: stats.avgMetaScoreState?.status === "AVAILABLE" ? stats.avgMetaScoreState.accuracy : "N/A", color: "text-primary" },
                  { label: "TRUST SCORE", value: stats.trustScoreState?.status === "AVAILABLE" ? `${stats.trustScoreState.score}/100` : "N/A", color: "text-orange-400" },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-gray-900 pb-2">
                    <span className="text-[10px] font-mono text-gray-600">{stat.label}</span>
                    <span className={`text-sm font-black font-mono ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ISAC assessment */}
            <div className="border border-primary/20 bg-primary/5 p-4">
              <div className="text-[9px] font-mono text-primary/50 tracking-widest mb-2">// ISAC FIELD ASSESSMENT</div>
              <p className="text-xs font-mono text-gray-400 leading-relaxed">
                {creator.name} operates primarily as a{" "}
                <span className="text-primary">{archetypeBreakdown[0]?.archetype ?? "mixed"}</span> specialist
                with {stats.buildCount} indexed builds.
                {stats.omegaBuilds > 0
                  ? ` ${stats.omegaBuilds} build${stats.omegaBuilds > 1 ? "s" : ""} currently hold OMEGA threat classification.`
                  : " No builds currently hold OMEGA classification."}
              </p>
              <div className="mt-3 text-[9px] font-mono text-gray-700">
                SIGNAL CONFIDENCE: {stats.trustScore}% · SOURCE: VERIFIED
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center text-xs font-mono text-gray-600">
          <Link href="/creators" className="hover:text-primary flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Back to Creator Network
          </Link>
          <span>SHD_OS // CREATOR_INTEL v1.0</span>
        </div>
      </div>
  );
}
