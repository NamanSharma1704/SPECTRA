import Image from "next/image";

interface VideoData {
  video_id: string;
  title: string;
  published_at: string;
  creator: string;
  thumbnail_url: string;
}

export function CategorizedVideoFeed({ title, videos, color = "primary" }: { title: string, videos: VideoData[], color?: "primary" | "cyan" | "purple" }) {
  if (!videos || videos.length === 0) return null;

  const colorMap = {
    primary: "border-primary text-primary",
    cyan: "border-cyan-500 text-cyan-400",
    purple: "border-purple-500 text-purple-400",
  };
  const theme = colorMap[color];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${theme.split(" ")[1]}`} />
        <h2 className={`font-mono text-sm tracking-widest uppercase font-bold ${theme.split(" ")[1]}`}>{title}</h2>
      </div>

      <div className="space-y-4">
        {videos.map((v) => (
          <a
            key={v.video_id}
            href={`https://youtube.com/watch?v=${v.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 glass-card p-3 border-white/5 hover:border-white/20 hover:scale-[1.02] transition-all"
          >
            <div className="relative w-32 h-20 shrink-0 bg-black/50 rounded-lg overflow-hidden shadow-inner">
              {v.thumbnail_url ? (
                <Image src={v.thumbnail_url} alt={v.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <h3 className="text-gray-200 font-bold text-sm line-clamp-2 leading-snug group-hover:text-white">{v.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-gray-400">{v.creator}</span>
                <span className="text-gray-700">•</span>
                <span className="text-[10px] font-mono text-gray-500">
                  {new Date(v.published_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
