import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { db } from "@/server/db";
import { CategorizedVideoFeed } from "@/components/intel/CategorizedVideoFeed";
import { TrendingService } from "@/server/services/TrendingService";
import { CommunityConsensus } from "@/components/intel/CommunityConsensus";
import { TrustService } from "@/server/services/TrustService";
import { MetaStatusPanel } from "@/components/intel/MetaStatusPanel";
import { EarlyAdoptersPanel } from "@/components/intel/EarlyAdoptersPanel";
import { PatchCausalityPanel } from "@/components/intel/PatchCausalityPanel";
import { PatchService } from "@/server/services/PatchService";

export const dynamic = "force-dynamic";

export default async function GearsetMetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: videos, error } = await (db as any)
    .from("creator_videos")
    .select("video_id, title, published_at, creators(name), thumbnail_url, content_tags")
    .contains("content_tags", { gearset: [{ slug }] })
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
  }

  const hasVideos = videos && videos.length > 0;
  const displayName = hasVideos
    ? videos[0].content_tags?.gearset?.find((g: any) => g.slug === slug)?.displayName || slug.toUpperCase()
    : slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const formattedVideos = hasVideos ? videos.map((v: any) => ({
    ...v,
    creator: v.creators?.name || "Unknown"
  })) : [];

  const trending = await TrendingService.getTrending(14);
  const consensusData = trending.trendingGearsets.find((g: any) => g.slug === slug);
  const lifecycleStatus = await TrendingService.getMetaLifecycleStatus(slug, "gearset");

  // Fetch recent patch changes for this gearset
  const patchChanges = await PatchService.getChangesForTarget(slug, "gearset");
  const { adopters, daysToConsensus } = await TrustService.getEarlyAdopters(slug, "gearset");

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 mt-10">
        <div className="border-b border-gray-800 pb-6">
          <div className="text-[10px] font-mono text-purple-500 tracking-widest mb-2 uppercase">Gearset Meta Data</div>
          <h1 className="text-4xl font-black font-mono text-white tracking-tight uppercase">
            {displayName}
          </h1>
          <p className="text-gray-400 font-mono mt-4 max-w-2xl text-sm">
            Analysis of recent builds and gameplay videos utilizing the {displayName} set.
          </p>
          <div className="mt-6">
            <a href={`/gearset/${slug}/timeline`} className="inline-flex items-center gap-2 border border-purple-500/50 bg-purple-900/20 px-4 py-2 text-sm font-mono text-purple-300 hover:bg-purple-900/40 transition-colors">
              View Intelligence Timeline
            </a>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Videos */}
        <div className="lg:col-span-8 space-y-8">
          <CategorizedVideoFeed title={`LATEST ${displayName} INTEL`} videos={formattedVideos} color="purple" />
        </div>

        {/* Right Column - Intelligence */}
        <div className="lg:col-span-4 space-y-6">
          <PatchCausalityPanel changes={patchChanges} />
          {consensusData && (
            <>
              <MetaStatusPanel 
                confidence={consensusData.confidenceScore} 
                consensusCount={consensusData.creatorCount}
                lifecycle={lifecycleStatus}
                color="purple"
              />
              <EarlyAdoptersPanel 
                adopters={adopters} 
                daysToConsensus={daysToConsensus} 
                color="purple"
              />
              <CommunityConsensus 
                confidenceLabel={consensusData.confidenceLabel}
                creators={consensusData.creators}
              />
            </>
          )}
        </div>
      </div>
      </div>
    </AppLayout>
  );
}
