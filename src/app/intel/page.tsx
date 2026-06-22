import { IntelligenceService } from "@/server/services/IntelligenceService";
import { AppLayout } from "@/components/layout/AppLayout";
import { GlobalKPIRibbon } from "@/components/intel/GlobalKPIRibbon";
import { UnifiedLiveTicker } from "@/components/intel/UnifiedLiveTicker";
import { TopActivityBuilds } from "@/components/intel/TopActivityBuilds";
import { WinnersVsLosersPanel } from "@/components/intel/WinnersVsLosersPanel";
import { TopForecastersPanel } from "@/components/intel/TopForecastersPanel";
import { MediaVault } from "@/components/intel/MediaVault";

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
      <div className="text-gray-200 max-w-[1800px] mx-auto pb-20">
        
        {/* Top Ribbon */}
        <GlobalKPIRibbon stats={stats} generatedAt={generatedAt} />

        {/* Dense Bento Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-auto xl:h-[800px]">
          
          {/* Main Analytics Arena (Left/Center) */}
          <div className="xl:col-span-8 flex flex-col gap-6 h-full">
            
            {/* Top Builds Spotlight (Takes up top half of center area) */}
            <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 rounded-xl shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] overflow-hidden flex-none">
               <TopActivityBuilds entries={topPerActivity} />
            </div>

            {/* Sub-panels Grid (Takes up bottom half) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[300px]">
              
              {/* Patch Impact Visualizer */}
              <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                <div className="text-[10px] font-sans font-bold text-gray-500 uppercase tracking-widest mb-6 px-2">
                  Patch Volatility Impact
                </div>
                <WinnersVsLosersPanel winners={patchImpact.winners} losers={patchImpact.losers} />
              </div>

              {/* Forecasters / Leaderboards */}
              <div className="bg-[#050505]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[inset_0_0_20px_rgba(255,106,0,0.02)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                 <TopForecastersPanel forecasters={topForecasters} />
              </div>

            </div>
          </div>

          {/* Unified Live Ticker (Right Sidebar) */}
          <div className="xl:col-span-4 h-full min-h-[500px]">
            <UnifiedLiveTicker 
              metaAlerts={metaAlerts} 
              consensusAlerts={consensusAlerts} 
              creatorSignals={creatorSignals} 
            />
          </div>

        </div>

        {/* Hidden Media Vault */}
        <MediaVault intelFeeds={intelFeeds} />

      </div>
    </AppLayout>
  );
}
