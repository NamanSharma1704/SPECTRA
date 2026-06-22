import { IntelligenceService } from "@/server/services/IntelligenceService";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalKPIRibbon } from "@/components/intel/GlobalKPIRibbon";
import { UnifiedLiveTicker } from "@/components/intel/UnifiedLiveTicker";
import { TopActivityBuilds } from "@/components/intel/TopActivityBuilds";
import { TopForecastersPanel } from "@/components/intel/TopForecastersPanel";
import { MediaVault } from "@/components/intel/MediaVault";
import { MetaMetricsRow } from "@/components/intel/MetaMetricsRow";

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
    throw new Error(`Failed to load intelligence briefing: ${err?.message ?? "Unknown error"}`);
  }

  const {
    generatedAt,
    metaAlerts,
    topPerActivity,
    creatorSignals,
    consensusAlerts,
    topForecasters,
    intelFeeds,
    stats,
    metaMetrics
  } = intel;

  return (
    <AppLayout>
      <div className="text-gray-200 max-w-[1800px] mx-auto pb-20 pt-4">
        
        {/* Top Ribbon */}
        <GlobalKPIRibbon stats={stats} generatedAt={generatedAt} />

        {/* Dense Bento Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Main Analytics Arena (Left/Center) */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            
            {/* Top Builds Spotlight (Activity Matrix) */}
            <TopActivityBuilds entries={topPerActivity} />

            {/* Secondary Metrics Row */}
            <MetaMetricsRow metrics={metaMetrics} />

            {/* Media Intercepts (Tabs) */}
            <MediaVault intelFeeds={intelFeeds} />

          </div>

          {/* Right Sidebar */}
          <div className="xl:col-span-4 flex flex-col gap-6 h-[1000px]">
            {/* Live Intelligence Feed */}
            <div className="h-[60%]">
              <UnifiedLiveTicker 
                metaAlerts={metaAlerts} 
                consensusAlerts={consensusAlerts} 
                creatorSignals={creatorSignals} 
              />
            </div>

            {/* Forecasters / Leaderboards */}
            <div className="h-[40%]">
              <TopForecastersPanel forecasters={topForecasters} />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
