import { Play, Shield, Terminal } from "lucide-react";
import Image from "next/image";

interface TimelineItem {
  id: string;
  type: "BUILD" | "VIDEO" | "NEWS" | "GUIDE";
  title: string;
  date: string;
  url?: string;
  thumbnailUrl?: string;
  metaScore?: number;
}

export function CreatorActivityTimeline({ builds, videos }: { builds: any[], videos: any[] }) {
  const items: TimelineItem[] = [];

  // Map Builds
  builds.forEach(b => {
    items.push({
      id: b.id,
      type: "BUILD",
      title: `[BUILD LOGGED] ${b.name}`,
      date: b.created_at,
      metaScore: b.peakScore
    });
  });

  // Map Videos
  videos.forEach(v => {
    let type: TimelineItem["type"] = "VIDEO";
    if (v.primary_category === "NEWS" || v.primary_category === "PATCH") type = "NEWS";
    if (v.primary_category === "GUIDE") type = "GUIDE";

    items.push({
      id: v.video_id,
      type,
      title: v.title,
      date: v.published_at,
      url: v.youtube_url,
      thumbnailUrl: v.thumbnail_url
    });
  });

  // Sort by date descending
  items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (items.length === 0) return null;

  return (
    <div className="border border-gray-800 bg-black/40 p-5 mt-6">
      <div className="flex items-center gap-2 mb-6">
        <Terminal className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-mono font-bold tracking-widest text-gray-300 uppercase">Activity Timeline</h2>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-800 before:to-transparent">
        {items.map((item, i) => (
          <div key={`${item.id}-${i}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Icon */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-700 bg-gray-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              {item.type === "BUILD" && <Shield className="w-4 h-4 text-cyan-400" />}
              {item.type === "VIDEO" && <Play className="w-4 h-4 text-red-500" />}
              {item.type === "NEWS" && <Terminal className="w-4 h-4 text-purple-400" />}
              {item.type === "GUIDE" && <Terminal className="w-4 h-4 text-primary" />}
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 border border-gray-800 bg-gray-900/50 hover:bg-gray-900 hover:border-gray-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold tracking-widest font-mono ${
                  item.type === "BUILD" ? "text-cyan-500" :
                  item.type === "VIDEO" ? "text-red-500" :
                  item.type === "NEWS" ? "text-purple-500" :
                  "text-primary"
                }`}>{item.type}</span>
                <time className="text-[10px] font-mono text-gray-500">{new Date(item.date).toLocaleDateString()}</time>
              </div>
              
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block group/link">
                  {item.thumbnailUrl && (
                    <div className="relative w-full h-24 mb-2 opacity-70 group-hover/link:opacity-100 transition-opacity bg-black">
                      <Image src={item.thumbnailUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" />
                    </div>
                  )}
                  <div className="text-sm font-bold text-gray-200 group-hover/link:text-white line-clamp-2">
                    {item.title}
                  </div>
                </a>
              ) : (
                <div>
                  <div className="text-sm font-bold text-gray-200">{item.title}</div>
                  {item.metaScore !== undefined && (
                    <div className="text-xs font-mono text-gray-400 mt-2">
                      Meta Score: <span className="text-cyan-400 font-bold">{item.metaScore}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
