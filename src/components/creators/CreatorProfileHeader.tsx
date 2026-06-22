import { ShieldCheck, ExternalLink, Star, Radio } from "lucide-react";

interface CreatorProfileHeaderProps {
  creator: { id: string; name: string; is_verified: boolean | null; youtube_url: string | null };
  stats: { buildCount: number; avgMetaScoreState: any; peakMetaScore: number; trustScoreState: any; omegaBuilds: number; verifiedBuilds?: number; sourceVideos?: number };
}

export function CreatorProfileHeader({ creator, stats }: CreatorProfileHeaderProps) {
  return (
    <div className="mb-8 border-b border-gray-800 pb-6">
      {/* Classification */}
      <div className="text-[10px] font-mono text-gray-600 tracking-widest mb-4">
        SHD_OS // CREATOR_INTELLIGENCE // FIELD_ANALYST
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        {/* Left: Identity */}
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 border-2 border-primary/40 bg-primary/10 flex items-center justify-center flex-shrink-0 relative">
            <span className="text-2xl font-black font-mono text-primary">
              {creator.name.charAt(0).toUpperCase()}
            </span>
            {creator.is_verified && (
              <div className="absolute -bottom-2 -right-2 bg-cyan-500 rounded-full p-0.5">
                <ShieldCheck className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl font-black font-mono text-white uppercase tracking-tight">
                {creator.name}
              </h1>
              {creator.is_verified && (
                <span className="text-[9px] font-mono font-bold border border-cyan-500/40 bg-cyan-950/20 text-cyan-400 px-2 py-0.5 tracking-widest">
                  VERIFIED SOURCE
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-500">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-primary" />
                {stats.buildCount} BUILDS IN DATABASE
              </span>
              {creator.youtube_url && (
                <a
                  href={creator.youtube_url.startsWith("http") ? creator.youtube_url : `https://${creator.youtube_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary/60 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Channel
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Key stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "TRUST SCORE", value: stats.trustScoreState?.status === "AVAILABLE" ? `${stats.trustScoreState.score}` : "N/A", color: "text-primary" },
            { label: "VERIFIED BUILDS", value: stats.verifiedBuilds != null ? `${stats.verifiedBuilds}` : "N/A", color: "text-green-400" },
            { label: "SOURCE VIDEOS", value: stats.sourceVideos != null ? `${stats.sourceVideos}` : "N/A", color: "text-purple-400" },
            { label: "AVG META", value: stats.avgMetaScoreState?.status === "AVAILABLE" ? `${stats.avgMetaScoreState.accuracy}` : "N/A", color: "text-cyan-400" },
            { label: "PEAK META", value: stats.peakMetaScore > 0 ? `${stats.peakMetaScore}` : "N/A", color: "text-orange-400" },
            { label: "OMEGA BUILDS", value: `${stats.omegaBuilds}`, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-800 bg-black/40 px-4 py-3 text-center">
              <div className="text-[9px] font-mono text-gray-600 tracking-widest mb-1">{stat.label}</div>
              <div className={`text-2xl font-black font-mono ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 h-px bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
    </div>
  );
}
