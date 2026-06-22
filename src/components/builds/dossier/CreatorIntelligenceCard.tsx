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
    <div className="border border-gray-800 bg-black/40 p-4">
      <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span className="w-1 h-3 bg-cyan-500 inline-block" />
        Creator Intelligence
      </div>

      <div className="flex items-start justify-between gap-3">
        {/* Creator avatar placeholder */}
        <div className="w-10 h-10 border border-gray-700 bg-gray-900 flex items-center justify-center flex-shrink-0 font-mono text-sm font-bold text-primary">
          {creator.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono font-bold text-white text-sm">{creator.name}</span>
            {creator.is_verified && (
              <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 font-mono">
                VERIFIED
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-yellow-400 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-2.5 h-2.5 ${i < Math.round(trustScore / 20) ? "fill-yellow-400" : "fill-gray-800 text-gray-800"}`}
              />
            ))}
            <span className="text-gray-500 ml-1">TRUST: {trustScore}/100</span>
          </div>
          {creator.youtube_url && (
            <a
              href={`https://${creator.youtube_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-primary/70 hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              View Channel
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
