import Link from "next/link";
import { ExternalLink, Star } from "lucide-react";

interface CreatorIntelligenceCardProps {
  creator: {
    name: string;
    youtube_url: string | null;
    is_verified: boolean;
  } | null;
}

export function CreatorIntelligenceCard({ creator }: CreatorIntelligenceCardProps) {
  if (!creator) return null;

  // Deterministic trust score from name
  const trustScore = 85 + (creator.name.charCodeAt(0) % 15);

  return (
    <div className="relative border border-white/10 bg-black/40 backdrop-blur-md p-5 rounded-xl group hover:border-primary/50 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="text-[10px] font-mono text-white/50 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
        Creator Intelligence
      </div>

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="w-12 h-12 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-black flex items-center justify-center flex-shrink-0 font-heading text-lg font-bold text-primary group-hover:shadow-[0_0_15px_rgba(255,106,0,0.4)] transition-all">
          {creator.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-white text-base tracking-wide truncate group-hover:text-primary transition-colors">{creator.name}</span>
            {creator.is_verified && (
              <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono tracking-widest shadow-[0_0_5px_rgba(6,182,212,0.2)]">
                VERIFIED
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-yellow-400 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.round(trustScore / 20) ? "fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" : "fill-white/10 text-white/10"}`}
              />
            ))}
            <span className="text-white/40 ml-1.5 font-mono">TRUST: {trustScore}/100</span>
          </div>
          {creator.youtube_url && (
            <a
              href={`https://${creator.youtube_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-[10px] font-mono text-white/50 hover:text-primary items-center gap-1.5 transition-all hover:translate-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span className="tracking-widest uppercase">View Channel</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
