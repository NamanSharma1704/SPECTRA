import { Activity, Terminal, AlertTriangle, GitCommit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PatchService } from "@/server/services/PatchService";
import { WinnersVsLosersPanel } from "@/components/intel/WinnersVsLosersPanel";
import { UnexpectedWinnersPanel } from "@/components/intel/UnexpectedWinnersPanel";
import { PatchIntelligenceTimeline } from "@/components/intel/PatchIntelligenceTimeline";
import { format } from "date-fns";
import { PatchClientWrapper } from "./PatchClientWrapper";

export const dynamic = "force-dynamic";

export default async function PatchIntelligence() {
  const causality = await PatchService.getPatchCausality();
  
  let timeline: any[] = [];
  if (causality?.patch?.id) {
    timeline = await PatchService.getPatchTimeline(causality.patch.id);
  }

  return (
    <PatchClientWrapper>
      <div className="patch-header flex items-center justify-between border-b border-primary/20 pb-4 mb-6 relative">
        <div className="absolute -bottom-[1px] left-0 w-32 h-[1px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
        <div>
          <h1 className="text-4xl font-bold tracking-[0.2em] text-primary neon-text font-heading uppercase flex items-center gap-4">
            <Activity className="w-8 h-8 drop-shadow-[0_0_8px_rgba(255,106,0,0.8)]" />
            PATCH INTELLIGENCE
          </h1>
          <p className="text-primary/50 mt-2 text-xs font-sans tracking-[0.3em] font-bold uppercase">Causality & Correlation Analytics</p>
        </div>
      </div>

      {!causality ? (
        <div className="text-center p-12 glass-panel font-sans font-bold text-gray-500 uppercase tracking-widest">
          No Recent Patches Found
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header Info */}
          <div className="patch-overview glass-panel p-6 relative overflow-hidden border-l-4 border-l-primary">
            <div className="absolute top-0 right-0 p-2 bg-primary/10 border-b border-l border-primary/20">
               <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold font-heading text-white tracking-widest uppercase relative z-10 drop-shadow-md">
                  {causality.patch.name}
                </h2>
                <div className="text-xs font-sans font-bold text-gray-400 mt-2 tracking-widest uppercase">
                  Released {format(new Date(causality.patch.release_date), "MMMM d, yyyy")}
                </div>
              </div>
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 rounded-none font-sans tracking-widest font-bold shadow-[0_0_10px_rgba(255,106,0,0.2)]">
                <GitCommit className="w-4 h-4 mr-2" /> ACTIVE
              </Badge>
            </div>
            <p className="font-sans text-sm text-gray-400 mt-6 max-w-3xl leading-relaxed">
              {causality.patch.summary}
            </p>
          </div>

          <div className="patch-panel">
            <WinnersVsLosersPanel winners={causality.winners} losers={causality.losers} />
          </div>
          
          <div className="patch-panel">
            <UnexpectedWinnersPanel winners={causality.unexpectedWinners} />
          </div>

          <div className="patch-panel">
            <PatchIntelligenceTimeline timeline={timeline} />
          </div>
        </div>
      )}
    </PatchClientWrapper>
  );
}
