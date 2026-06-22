import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { DIPClient } from "@/client/sdk";
import { DossierHeader } from "@/components/builds/dossier/DossierHeader";
import { VerdictPanel } from "@/components/builds/dossier/VerdictPanel";
import { ActivityRadarChart } from "@/components/builds/dossier/ActivityRadarChart";
import { ActivityScoreBars } from "@/components/builds/dossier/ActivityScoreBars";
import { ThreatAssessmentPanel } from "@/components/builds/dossier/ThreatAssessmentPanel";
import { CreatorIntelligenceCard } from "@/components/builds/dossier/CreatorIntelligenceCard";
import { BuildDNAStrand } from "@/components/builds/dossier/BuildDNAStrand";
import { IntelligenceSourcesPanel } from "@/components/builds/dossier/IntelligenceSourcesPanel";
import { IntelligenceTimeline } from "@/components/builds/dossier/IntelligenceTimeline";

export const dynamic = "force-dynamic";

export default async function BuildDossierSourcePage({
  params,
}: {
  params: Promise<{ id: string; sourceId: string }>;
}) {
  const { id, sourceId } = await params;

  let data: any;
  try {
    data = await DIPClient.getBuild(id);
  } catch {
    notFound();
  }

  const { build, verdict, scoredActivities, topActivity, avgMetaScore } = data;

  if (!build) notFound();

  // Prepare radar data
  const radarPoints = scoredActivities.map((s: any) => ({
    label: (s.activities?.name ?? "").replace(" Missions", "").replace(" Points", ""),
    score: Math.round(s.meta_score),
  }));

  // Prepare bar data
  const barData = scoredActivities.map((s: any) => ({
    name: s.activities?.name ?? "Unknown",
    score: Math.round(s.meta_score),
    tier: s.tier,
  }));

  // Top threat level
  const topThreat =
    scoredActivities.find((s: any) => s.threat_level === "OMEGA")?.threat_level ??
    scoredActivities.find((s: any) => s.threat_level === "ALPHA")?.threat_level ??
    "GAMMA";

  // Avg confidence
  const avgConfidence = scoredActivities.length
    ? Math.round(scoredActivities.reduce((sum: number, s: any) => sum + s.confidence_score, 0) / scoredActivities.length)
    : 0;

  // Top activity for DNA strand
  const topActivitiesForDNA = scoredActivities.slice(0, 2).map((s: any) => ({
    name: s.activities?.name ?? "",
    score: s.meta_score,
  }));

  return (
    <div className="text-gray-200 font-mono">

      {/* Breadcrumb nav */}
      <nav className="flex items-center gap-2 mb-6 text-xs font-mono text-gray-600">
        <Link href="/builds" className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> BUILD_INTELLIGENCE
        </Link>
        <span>/</span>
        <span className="text-gray-400 truncate max-w-[200px] sm:max-w-none">{build.name.toUpperCase().slice(0, 40)}</span>
      </nav>

        {/* ── ZONE 1: Classification Header ── */}
        <DossierHeader build={build} verdict={verdict} />

        {/* ── ZONE 2: Verdict Panel ── */}
        <VerdictPanel
          verdict={verdict}
          avgMetaScore={avgMetaScore}
          scoredActivities={scoredActivities}
        />

        {/* ── ZONE 3: Intelligence Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* LEFT — 8 cols: Radar + Score Bars */}
          <div className="lg:col-span-8 space-y-6">
            <div className="border border-gray-800 bg-black/40 p-6">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-1 h-3 bg-primary inline-block" />
                Activity Performance Matrix
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Radar Chart */}
                <div className="flex-shrink-0">
                  <div className="text-[9px] text-gray-600 font-mono mb-2 text-center tracking-widest">THREAT TOPOGRAPHY</div>
                  {radarPoints.length >= 3 ? (
                    <ActivityRadarChart points={radarPoints} />
                  ) : (
                    <div className="w-[220px] h-[220px] border border-gray-800 flex items-center justify-center text-gray-700 text-xs">
                      INSUFFICIENT DATA
                    </div>
                  )}
                </div>

                {/* Score Bars */}
                <div className="flex-1 w-full">
                  <div className="text-[9px] text-gray-600 font-mono mb-3 tracking-widest">FIELD PERFORMANCE RANKINGS</div>
                  <ActivityScoreBars activities={barData} />

                  {/* Legend */}
                  <div className="flex gap-4 mt-4 text-[9px] font-mono text-gray-600">
                    {[["S", "text-cyan-400"], ["A", "text-orange-400"], ["B", "text-yellow-400"], ["C", "text-gray-500"], ["D", "text-red-900"]].map(([t, c]) => (
                      <span key={t} className="flex items-center gap-1">
                        <span className={`font-bold ${c}`}>{t}</span>
                        <span>
                          {t === "S" ? "≥90" : t === "A" ? "80" : t === "B" ? "70" : t === "C" ? "60" : "<60"}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mission Suitability Cards */}
            <div className="border border-gray-800 bg-black/40 p-6">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-orange-500 inline-block" />
                Mission Suitability Assessment
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {scoredActivities.map((s: any) => {
                  const tierColors: Record<string, string> = {
                    S: "border-cyan-500/40 bg-cyan-950/20 text-cyan-400",
                    A: "border-orange-500/40 bg-orange-950/20 text-orange-400",
                    B: "border-yellow-600/40 bg-yellow-950/10 text-yellow-400",
                    C: "border-gray-700 bg-gray-900/30 text-gray-400",
                    D: "border-red-900/40 bg-red-950/10 text-red-700",
                  };
                  const tc = tierColors[s.tier] ?? tierColors.C;
                  return (
                    <Link
                      key={s.activities?.name}
                      href={`/activities/${(s.activities?.name ?? "").toLowerCase().replace(/ /g, "-")}`}
                      className={`border p-3 flex flex-col gap-1 hover:opacity-80 transition-opacity group ${tc}`}
                    >
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest truncate">
                        {s.activities?.type}
                      </div>
                      <div className="text-xs font-bold truncate">{s.activities?.name}</div>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-3xl font-black">{s.tier}</span>
                        <span className="text-[10px] opacity-60">{Math.round(s.meta_score)}</span>
                      </div>
                      <div className="text-[8px] opacity-0 group-hover:opacity-60 transition-opacity flex items-center gap-0.5">
                        View Activity <ArrowUpRight className="w-2 h-2" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT — 4 cols: Threat + Creator + Patch */}
          <div className="lg:col-span-4 space-y-4">
            <ThreatAssessmentPanel
              topThreat={topThreat}
              avgConfidence={avgConfidence}
              topActivity={topActivity}
            />

            <CreatorIntelligenceCard creator={build.creators} />

            {/* Patch Watch placeholder */}
            <div className="border border-gray-800 bg-black/40 p-4">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1 h-3 bg-yellow-500 inline-block" />
                Patch Watch
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 font-mono">STABLE</span>
                <span className="text-gray-600 ml-auto font-mono text-[10px]">No nerfs detected</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                No patch activity detected affecting this build's core mechanics in the last 30 days.
              </p>
            </div>

            {/* Quick stats */}
            <div className="border border-gray-800 bg-black/40 p-4 grid grid-cols-2 gap-3">
              {[
                { label: "AVG META", value: avgMetaScore },
                { label: "CONFIDENCE", value: avgConfidence },
                { label: "ARCHETYPE", value: build.archetype ?? "—" },
                { label: "ACTIVITIES", value: scoredActivities.length },
              ].map((stat) => (
                <div key={stat.label} className="border border-gray-800 p-2">
                  <div className="text-[8px] font-mono text-gray-600 tracking-widest">{stat.label}</div>
                  <div className="text-lg font-black font-mono text-primary">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ZONE 4: Build DNA ── */}
        <BuildDNAStrand
          archetype={build.archetype}
          buildName={build.name}
          topActivities={topActivitiesForDNA}
        />

        {/* ── ZONE 5: Intelligence Sources & Timeline ── */}
        <div className="mb-12 mt-8 border-t border-primary/20 pt-8" id="evidence-network">
          <IntelligenceSourcesPanel build={build} selectedSourceId={sourceId} />
          <IntelligenceTimeline build={build} />
        </div>

        {/* Footer nav */}
      <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3 text-xs font-mono text-gray-600">
        <Link href="/builds" className="hover:text-primary flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> Back to Build Intelligence
        </Link>
        <span className="hidden sm:block">SHD_OS // DOSSIER v2.0 // CLEARANCE: OMEGA</span>
      </div>
    </div>
  );
}
