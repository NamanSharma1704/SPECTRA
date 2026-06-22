import { IntelligenceFeed } from "@/components/timeline/IntelligenceFeed";
import taxonomy from "@/server/data/division2_taxonomy.json";
import { TimelineRepository } from "@/server/repositories/TimelineRepository";
import type { TimelineEntityType } from "@/types/timeline";
import { ArrowLeft, History } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TimelineClient } from "./TimelineClient";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set<TimelineEntityType>(["gearset", "weapon", "skill"]);

function isTimelineEntityType(value: string): value is TimelineEntityType {
  return VALID_TYPES.has(value as TimelineEntityType);
}

function getDisplayName(type: TimelineEntityType, slug: string): string {
  const taxonomyTypes: Record<TimelineEntityType, string[]> = {
    gearset: ["gearset"],
    weapon: ["weapons", "exotic_weapon", "named_weapon"],
    skill: ["skill"],
  };

  const entity = taxonomy.find(
    (item) => item.slug === slug && taxonomyTypes[type].includes(item.type),
  );

  return entity?.canonical ?? slug.split("-").map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  ).join(" ");
}

export default async function MetaTimelinePage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>;
}) {
  const { type, slug } = await params;
  if (!isTimelineEntityType(type)) notFound();

  const displayName = getDisplayName(type, slug);
  const { events, velocity } = await TimelineRepository.getEntityTimeline(type, slug);
  const backHref = `/${type}`;

  return (
    <TimelineClient>
      <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 pb-24 mt-6">
        <div className="timeline-header mb-12">
          <Link
            href={backHref}
            className="inline-flex items-center text-[10px] font-sans font-bold tracking-[0.2em] text-primary/50 hover:text-primary transition-colors mb-6 uppercase bg-black/40 px-3 py-1.5 border border-primary/20 hover:border-primary/50"
          >
            <ArrowLeft className="w-3 h-3 mr-2" /> Back to {type}
          </Link>

          <div className="flex items-center gap-6 border-b border-primary/20 pb-6 relative">
            <div className="absolute -bottom-[1px] left-0 w-48 h-[2px] bg-primary shadow-[0_0_10px_rgba(255,106,0,1)] animate-pulse" />
            <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,106,0,0.2)]">
              <History className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-sans font-bold tracking-[0.3em] uppercase text-primary/50 mb-2">SHD_OS // TIMELINE_RECORD</div>
              <h1 className="text-4xl md:text-5xl font-black tracking-widest text-primary neon-text font-heading uppercase drop-shadow-md">
                {displayName} <span className="text-white/20">{"//"}</span> <span className="text-white">Intelligence Timeline</span>
              </h1>
              <p className="text-gray-400 mt-3 text-sm font-sans tracking-widest uppercase font-bold">
                Historical Narrative & Meta Evolution
              </p>
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="p-16 text-center glass-panel border-l-4 border-l-primary/50">
            <History className="w-16 h-16 text-primary/30 mx-auto mb-6 drop-shadow-md" />
            <h2 className="text-2xl font-heading font-black text-gray-300 uppercase tracking-widest mb-3">
              No Intelligence Data Found
            </h2>
            <p className="text-sm text-gray-500 font-sans tracking-wide leading-relaxed">
              There are no recorded forecasts, patches, or consensus shifts for this entity yet.
            </p>
          </div>
        ) : (
          <IntelligenceFeed events={events} velocity={velocity} />
        )}
      </div>
    </TimelineClient>
  );
}
