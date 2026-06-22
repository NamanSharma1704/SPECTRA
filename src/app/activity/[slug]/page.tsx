import { notFound } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { db } from "@/server/db";
import { CategorizedVideoFeed } from "@/components/intel/CategorizedVideoFeed";

export const dynamic = "force-dynamic";

export default async function ActivityMetaPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: videos, error } = await (db as any)
    .from("creator_videos")
    .select("video_id, title, published_at, creators(name), thumbnail_url, content_tags")
    .contains("content_tags", { activity: [{ slug }] })
    .order("published_at", { ascending: false })
    .limit(20);

  if (error || !videos || videos.length === 0) {
    notFound();
  }

  const displayName = videos[0].content_tags.activity.find((a: any) => a.slug === slug)?.displayName || slug.toUpperCase();

  const formattedVideos = videos.map((v: any) => ({
    ...v,
    creator: v.creators?.name || "Unknown"
  }));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 mt-10">
        <div className="border-b border-gray-800 pb-6">
          <div className="text-[10px] font-mono text-orange-500 tracking-widest mb-2 uppercase">Activity Meta Data</div>
          <h1 className="text-4xl font-black font-mono text-white tracking-tight uppercase">
            {displayName}
          </h1>
          <p className="text-gray-400 font-mono mt-4 max-w-2xl text-sm">
            Analysis of recent builds and gameplay videos optimized for {displayName}.
          </p>
        </div>

        <CategorizedVideoFeed title={`LATEST ${displayName} INTEL`} videos={formattedVideos} color="primary" />
      </div>
    </AppLayout>
  );
}
