import { notFound } from "next/navigation";
import { IntelligenceService } from "@/server/services/IntelligenceService";
import { AppLayout } from "@/components/layout/AppLayout";
import { CommandCenterHero } from "@/components/intel/CommandCenterHero";
import { MetaAlertsFeed } from "@/components/intel/MetaAlertsFeed";
import { PatchImpactPanel } from "@/components/intel/PatchImpactPanel";
import { ConsensusAlerts } from "@/components/intel/ConsensusAlerts";
import { CreatorSignalFeed } from "@/components/intel/CreatorSignalFeed";
import { EmergingBuildsPanel } from "@/components/intel/EmergingBuildsPanel";
import { TopActivityBuilds } from "@/components/intel/TopActivityBuilds";
import { TopForecastersPanel } from "@/components/intel/TopForecastersPanel";
import { CategorizedVideoFeed } from "@/components/intel/CategorizedVideoFeed";
import { WinnersVsLosersPanel } from "@/components/intel/WinnersVsLosersPanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "SPECTRA | Meta Intelligence Platform",
  description: "Live Division 2 meta intelligence. Meta alerts, patch watch, creator signals, emerging builds.",
};

export default async function IntelPage() {
  let intel: any;
  try {
    intel = await IntelligenceService.getDashboardIntel();
  } catch (err: any) {
    notFound();
  }

  const {
    generatedAt,
    metaAlerts,
    emergingBuilds,
    topPerActivity,
    creatorSignals,
    consensusAlerts,
    patchImpact,
    topForecasters,
    intelFeeds,
    stats,
  } = intel;

  return (
    <AppLayout>
      <div className="text-gray-200 font-sans max-w-[1600px] mx-auto">
        
        {/* 1. Command Center Hero */}
        <CommandCenterHero generatedAt={generatedAt} stats={stats} />

        {/* 2. Primary Spotlight Data */}
        <div className="mb-10">
          <TopActivityBuilds entries={topPerActivity} />
        </div>

        {/* 3. Asymmetrical Data Flow (Left Stream / Right Spotlight) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT: Intelligence Stream */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <div className="glass-card p-6 border-white/5">
              <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">
                Live Data Stream
              </div>
              <div className="flex flex-col gap-10">
                <MetaAlertsFeed alerts={metaAlerts} />
                <div className="h-px bg-white/5 w-full" />
                <EmergingBuildsPanel builds={emergingBuilds} />
              </div>
            </div>

            {/* Winners / Losers Impact Panel Spotlight */}
            <div className="glass-card p-6 border-white/5">
              <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">
                Patch Impact Analysis
              </div>
              <WinnersVsLosersPanel winners={patchImpact.winners} losers={patchImpact.losers} />
            </div>
          </div>

          {/* RIGHT: Analytical Sidebar */}
          <aside className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Independent Agreement */}
            <div className="glass-card p-6 border-white/5">
               <ConsensusAlerts alerts={consensusAlerts} />
            </div>

            {/* Creator Signals */}
            <div className="glass-card p-6 border-white/5">
               <CreatorSignalFeed signals={creatorSignals} />
            </div>

            {/* Top Forecasters */}
            <div className="glass-card p-6 border-white/5">
               <TopForecastersPanel forecasters={topForecasters} />
            </div>

            {/* Broadcast */}
            <div className="border border-primary/20 bg-primary/5 p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              <div className="text-[9px] font-mono text-primary/60 tracking-widest mb-2">
                // ISAC BROADCAST
              </div>
              <p className="text-xs font-mono text-gray-400 leading-relaxed">
                The meta is shifting. Striker-class builds continue to dominate endgame content. 
                Monitor Heartbreaker variants — developer commentary suggests a balance review 
                in the next Title Update.
              </p>
              <div className="mt-3 text-[9px] font-mono text-gray-700">
                SIGNAL ORIGIN: SHD COMMAND // PRIORITY: HIGH
              </div>
            </div>
          </aside>
        </div>

        {/* 4. Deep Integrations (Video Feeds Carousel) */}
        <div className="glass-card p-8 border-white/5 mb-20">
          <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-6">
            Global Media Intercepts
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CategorizedVideoFeed title="LATEST PVP INTEL" videos={intelFeeds?.pvpVideos} color="cyan" />
            <CategorizedVideoFeed title="LATEST FARMING GUIDES" videos={intelFeeds?.farmingGuides} color="primary" />
            <CategorizedVideoFeed title="LATEST PATCH VIDEOS" videos={intelFeeds?.patchVideos} color="purple" />
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
