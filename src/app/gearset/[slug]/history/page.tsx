import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { db } from "@/server/db";
import { format } from "date-fns";
import { CircleDot, PlaySquare, Flame, Skull, TrendingDown } from "lucide-react";
import { TrendingService } from "@/server/services/TrendingService";
import { PatchService } from "@/server/services/PatchService";
import { BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GearsetHistoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Fetch videos for this gearset
  const { data: videos, error } = await (db as any)
    .from("creator_videos")
    .select("video_id, title, published_at, creators(id, name), thumbnail_url, content_tags")
    .contains("content_tags", { gearset: [{ slug }] })
    .order("published_at", { ascending: true }); // Chronological order

  if (error || !videos || videos.length === 0) {
    notFound();
  }

  const displayName = videos[0].content_tags.gearset.find((g: any) => g.slug === slug)?.displayName || slug.toUpperCase();

  // Build the timeline and calculate breakpoints
  const timeline: any[] = [];
  const uniqueCreators = new Set<string>();
  
  let hitEmerging = false;
  let hitEstablished = false;
  let hitDominant = false;
  let hitStandard = false;

  videos.forEach((v: any) => {
    // Add video event
    timeline.push({
      type: "video",
      date: new Date(v.published_at),
      title: v.title,
      creator: v.creators?.name || "Unknown",
    });

    const creatorId = v.creators?.id;
    if (creatorId) {
      uniqueCreators.add(creatorId);
      const count = uniqueCreators.size;

      // Check breakpoints
      if (count >= 3 && !hitEmerging) {
        hitEmerging = true;
        timeline.push({
          type: "breakpoint",
          date: new Date(v.published_at),
          label: "Emerging Meta",
          creators: count,
          color: "text-blue-400",
          bg: "bg-blue-500"
        });
      }
      if (count >= 5 && !hitEstablished) {
        hitEstablished = true;
        timeline.push({
          type: "breakpoint",
          date: new Date(v.published_at),
          label: "Established Meta",
          creators: count,
          color: "text-green-400",
          bg: "bg-green-500"
        });
      }
      if (count >= 8 && !hitDominant) {
        hitDominant = true;
        timeline.push({
          type: "breakpoint",
          date: new Date(v.published_at),
          label: "Dominant Meta",
          creators: count,
          color: "text-orange-400",
          bg: "bg-orange-500"
        });
      }
      if (count >= 12 && !hitStandard) {
        hitStandard = true;
        timeline.push({
          type: "breakpoint",
          date: new Date(v.published_at),
          label: "Community Standard",
          creators: count,
          color: "text-red-500",
          bg: "bg-red-500"
        });
      }
    }
  });

  const lifecycle = await TrendingService.getMetaLifecycleStatus(slug, "gearset");

  if (lifecycle === "Declining") {
    timeline.push({
      type: "terminal",
      date: new Date(), // Now
      label: "Declining",
      color: "text-orange-500",
      bg: "bg-orange-500",
      desc: "Score has dropped >25% and active creator coverage is decreasing."
    });
  } else if (lifecycle === "Dead Meta") {
    timeline.push({
      type: "terminal",
      date: new Date(),
      label: "Dead Meta",
      color: "text-red-600",
      bg: "bg-red-600",
      desc: "Zero creator coverage in the last 30 days. Consensus completely lost."
    });
  }

  const patchChanges = await PatchService.getChangesForTarget(slug, "gearset");
  patchChanges.forEach((pc: any) => {
    timeline.push({
      type: "patch_release",
      date: new Date(pc.releaseDate),
      label: `${pc.patchName} Released`,
      color: pc.changeType === "BUFF" ? "text-green-400" : pc.changeType === "NERF" ? "text-red-400" : "text-yellow-400",
      bg: "bg-blue-500",
      desc: `${pc.changeType}: ${pc.description}`
    });
  });

  // Reverse timeline to show newest first
  timeline.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 mt-10">
        <div className="border-b border-gray-800 pb-6">
          <div className="text-[10px] font-mono text-purple-500 tracking-widest mb-2 uppercase">Meta Evolution Tracking</div>
          <h1 className="text-4xl font-black font-mono text-white tracking-tight uppercase">
            {displayName} Timeline
          </h1>
          <p className="text-gray-400 font-mono mt-4 text-sm">
            Chronological analysis of creator coverage and consensus breakpoints.
          </p>
        </div>

        <div className="relative pl-6 border-l border-gray-800 space-y-12">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[29px] top-1">
                {event.type === "video" ? (
                  <CircleDot className="w-4 h-4 text-gray-600 bg-[#0a0a0a]" />
                ) : event.type === "terminal" ? (
                  event.label === "Dead Meta" ? 
                  <Skull className={`w-4 h-4 ${event.color} bg-[#0a0a0a]`} /> :
                  <TrendingDown className={`w-4 h-4 ${event.color} bg-[#0a0a0a]`} />
                ) : event.type === "patch_release" ? (
                  <BookOpen className={`w-5 h-5 text-blue-500 bg-[#0a0a0a]`} />
                ) : (
                  <Flame className={`w-4 h-4 ${event.color} bg-[#0a0a0a]`} />
                )}
              </div>

              {/* Event Content */}
              <div>
                <div className="text-xs font-mono text-gray-500 mb-1">
                  {format(event.date, "MMMM d, yyyy")}
                </div>
                {event.type === "video" ? (
                  <div className="flex gap-4 items-start bg-gray-900/30 border border-gray-800/50 p-4">
                    <PlaySquare className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-mono text-sm text-white mb-1">{event.creator}</div>
                      <div className="font-mono text-xs text-gray-400">{event.title}</div>
                    </div>
                  </div>
                ) : event.type === "terminal" ? (
                  <div className={`flex gap-4 items-center border p-4 border-gray-800/80 bg-gray-900/40`}>
                    <div className="flex-1">
                      <div className={`font-black font-mono text-lg uppercase ${event.color}`}>{event.label}</div>
                      <div className="font-mono text-xs text-gray-500 mt-1">{event.desc}</div>
                    </div>
                  </div>
                ) : event.type === "patch_release" ? (
                  <div className={`flex gap-4 items-center border p-4 border-blue-900/40 bg-blue-950/20`}>
                    <div className="flex-1">
                      <div className={`font-black font-mono text-lg uppercase ${event.color}`}>{event.label}</div>
                      <div className="font-mono text-xs text-gray-400 mt-1">{event.desc}</div>
                    </div>
                  </div>
                ) : (
                  <div className={`flex gap-4 items-center border p-4 bg-gray-900/50 border-gray-800`}>
                    <div className="flex-1">
                      <div className={`font-black font-mono text-lg uppercase ${event.color}`}>{event.label}</div>
                      <div className="font-mono text-xs text-gray-500 mt-1">Consensus reached {event.creators} independent creators.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
